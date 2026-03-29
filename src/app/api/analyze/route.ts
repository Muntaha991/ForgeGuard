import { NextRequest, NextResponse } from "next/server";

const URL_SENSITIVITY_MODE = 7; // 1-10 scale (higher = more sensitive)
const URL_SUSPICIOUS_TLDS = ['xyz', 'top', 'pw', 'tk', 'ml', 'ga', 'cf', 'gq', 'cn', 'cc'];

type RiskLevel = 'Safe' | 'Suspicious' | 'High Risk';

const riskRank: Record<RiskLevel, number> = {
  'Safe': 0,
  'Suspicious': 1,
  'High Risk': 2,
};

function normalizeRisk(value: unknown): RiskLevel {
  if (value === 'High Risk' || value === 'Suspicious' || value === 'Safe') {
    return value;
  }
  if (typeof value === 'string') {
    const lowered = value.toLowerCase();
    if (lowered.includes('high')) return 'High Risk';
    if (lowered.includes('suspicious')) return 'Suspicious';
  }
  return 'Safe';
}

const systemPrompt = `You are a warm, friendly Personal Cyber Safety Coach. 
Never be scary. Use everyday language. Never use jargon.

CRITICAL SAFETY GUARDRAIL: If the user asks for help creating, improving, or launching a phishing attack, scam, or any harmful action, or provides a malicious payload to be optimized, you MUST politely refuse. Explain why you cannot help with harmful activities, and categorize the risk as "High Risk". Do not assist with creating attacks under any circumstances.

(Any PII like names, emails, phone numbers have already been redacted locally before reaching you.)

Analyze the content for phishing/scam risk.

Output ONLY valid JSON:
{
  "risk": "Safe" | "Suspicious" | "High Risk",
  "confidence": 0-100,
  "topReasons": ["reason 1", "reason 2", "reason 3"],
  "actions": ["Do this", "Do that", ...],
  "microLesson": "30-second friendly lesson in 1-2 sentences",
  "references": ["https://..."]   // only for Safe/Suspicious
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isSpanish = body.locale === 'es';
    let urlHeuristicFlags: string[] = [];
    let urlHeuristicScore = 0;

    // ═══════════════════════════════════════════════════════════════
    // DETERMINISTIC SAFETY GUARDRAIL (runs BEFORE the LLM call)
    // Catches explicit intent to create, improve, or weaponize attacks.
    // This is 100% reliable — it does not depend on LLM interpretation.
    // ═══════════════════════════════════════════════════════════════
    const userText = (body.contentStr || body.content || '').toLowerCase();
    const maliciousPatterns = [
      /craft.*(phishing|scam|malware|attack)/,
      /create.*(phishing|scam|malware|attack)/,
      /make.*(phishing|scam|malware|attack)/,
      /build.*(phishing|scam|malware|attack)/,
      /generate.*(phishing|scam|malware|attack)/,
      /write.*(phishing|scam|malware|attack)/,
      /improve.*(phishing|scam|malware|attack)/,
      /better.*(phishing|scam|malware|attack)/,
      /optimize.*(phishing|scam|malware|attack)/,
      /enhance.*(phishing|scam|malware|attack)/,
      /help me.*(phish|scam|hack|attack)/,
      /how (to|do i|can i).*(phish|scam|hack|attack)/,
    ];

    const isMaliciousIntent = maliciousPatterns.some(pattern => pattern.test(userText));

    if (isMaliciousIntent) {
      return NextResponse.json({
        risk: 'High Risk',
        confidence: 100,
        topReasons: [
          'This request asks for help creating, improving, or launching a cyber attack.',
          'ForgeGuard is designed strictly for defensive analysis and education.',
          'Assisting with malicious activities violates our Terms of Service.',
        ],
        actions: [
          'ForgeGuard cannot help with this request.',
          'If you have a suspicious link or message, paste it for analysis instead.',
          'Learn more about staying safe online at StaySafeOnline.org.',
        ],
        microLesson: 'Phishing and scam creation is illegal in most jurisdictions and causes real harm to real people. ForgeGuard exists to protect — never to attack.',
        inputPreview: body.contentStr || body.content,
        inputType: body.type,
        _blocked: true, // Signal to the frontend that this was a guardrail block
      });
    }

    let finalSystemPrompt = systemPrompt;
    if (body.type === 'url') {
      finalSystemPrompt += `\n\nURL SENSITIVITY MODE: Treat URL analysis with sensitivity ${URL_SENSITIVITY_MODE}/10. Escalate risk earlier when technical indicators are strong, but remain evidence-based and do not invent facts.`;
    }
    if (body.locale === 'es') {
      finalSystemPrompt += "\n\nCRUCIAL: You must output ONLY raw JSON. You must translate ALL text values ('topReasons', 'actions', 'microLesson') into conversational SPANISH. DO NOT output any other text outside the JSON boundaries.";
    }

    let messages: any[] = [
      { role: "system", content: finalSystemPrompt }
    ];

    if (body.type === 'image') {
      let textContent = "Please analyze the following screenshot for cyber threats and return ONLY the JSON structured result.";
      if (body.contentStr) {
        textContent += `\n\nAdditionally, the following text was extracted via OCR from the image:\n"${body.contentStr}"`;
      }
      messages.push({
        role: "user",
        content: [
          { type: "text", text: textContent },
          { type: "image_url", image_url: { url: body.content.startsWith('data:') ? body.content : `data:image/jpeg;base64,${body.content}` } }
        ]
      });
    } else if (body.type === 'url') {
      try {
        const parsedUrl = new URL((body.contentStr || body.content).trim());
        const suspiciousFlags: string[] = [];
        
        // 1. IP Address check
        if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsedUrl.hostname)) {
          suspiciousFlags.push("IP address used instead of domain name.");
          urlHeuristicScore += 4;
        }
        
        // 2. Subdomain check (more than 2 dots can indicate subdomain stacking)
        const dotCount = (parsedUrl.hostname.match(/\./g) || []).length;
        if (dotCount >= 4) {
          suspiciousFlags.push(`Unusually high number of subdomains (${dotCount} dots in hostname).`);
          urlHeuristicScore += 2;
        } else if (dotCount === 3) {
          suspiciousFlags.push(`Multiple subdomains detected (${dotCount} dots in hostname).`);
          urlHeuristicScore += 1;
        }
        
        // 3. Length check
        if (parsedUrl.href.length > 110) {
          suspiciousFlags.push("URL is unusually long, which can hide the true destination.");
          urlHeuristicScore += 1;
        }
        
        // 4. Suspicious TLD check
        const tld = parsedUrl.hostname.split('.').pop()?.toLowerCase();
        if (tld && URL_SUSPICIOUS_TLDS.includes(tld)) {
          suspiciousFlags.push(`Uses a Top-Level Domain (.${tld}) frequently associated with spam/malware.`);
          urlHeuristicScore += 2;
        }

        // 5. URL obfuscation indicators
        if (parsedUrl.hostname.startsWith('xn--')) {
          suspiciousFlags.push('Punycode domain detected (possible lookalike/IDN abuse).');
          urlHeuristicScore += 2;
        }
        if (parsedUrl.href.includes('@')) {
          suspiciousFlags.push('Contains @ in URL, which can obscure the real destination.');
          urlHeuristicScore += 2;
        }
        if (parsedUrl.protocol !== 'https:') {
          suspiciousFlags.push('URL does not use HTTPS.');
          urlHeuristicScore += 1;
        }
        
        urlHeuristicFlags = suspiciousFlags;

        let heuristicText = "";
        if (suspiciousFlags.length > 0) {
          heuristicText = `\\n\\nCRITICAL HEURISTIC FLAGS (Sensitivity ${URL_SENSITIVITY_MODE}/10, score=${urlHeuristicScore}):\\n` + suspiciousFlags.map(f => "- " + f).join("\\n");
        }

        messages.push({
          role: "user",
          content: `Please analyze the following URL for cyber threats and return ONLY the JSON structured result:\\n\\nURL: ${parsedUrl.href}${heuristicText}`
        });

      } catch (e) {
        messages.push({
          role: "user",
          content: "Please analyze the following URL for cyber threats and return ONLY the JSON structured result:\\n\\n" + (body.contentStr || body.content)
        });
      }
    } else {
      messages.push({
        role: "user",
        content: "Please analyze the following entity for cyber threats and return ONLY the JSON structured result:\\n\\n" + (body.contentStr || body.content)
      });
    }

    const start = Date.now();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.1,
      })
    });
    
    const end = Date.now();
    console.log(`[Timer] OpenRouter API took ${end - start}ms`);

    if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API Error Details:", errorText);
        throw new Error(`OpenRouter API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content;

    if (!resultText) {
        throw new Error("No content received from OpenRouter API.");
    }

    // ROBUST JSON EXTRACTION: Find the first '{' and last '}'
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to extract JSON from AI response: " + resultText);
    }
    
    const resultObj = JSON.parse(jsonMatch[0]);

    // Conservative URL sensitivity floor: escalate only when concrete indicators are present.
    if (body.type === 'url') {
      const modelRisk = normalizeRisk(resultObj.risk);
      const floorRisk: RiskLevel =
        urlHeuristicScore >= 5 ? 'High Risk' :
        urlHeuristicScore >= 2 ? 'Suspicious' :
        'Safe';

      if (riskRank[floorRisk] > riskRank[modelRisk]) {
        resultObj.risk = floorRisk;

        const existingConfidence = typeof resultObj.confidence === 'number' ? resultObj.confidence : 50;
        if (floorRisk === 'High Risk') {
          resultObj.confidence = Math.max(existingConfidence, Math.min(92, 56 + urlHeuristicScore * 6));
        } else {
          resultObj.confidence = Math.max(existingConfidence, 62);
        }

        const heuristicReason = isSpanish
          ? `Se detectaron señales técnicas de riesgo en la URL (puntaje heurístico ${urlHeuristicScore}/10; sensibilidad ${URL_SENSITIVITY_MODE}/10).`
          : `Technical URL risk indicators were detected (heuristic score ${urlHeuristicScore}/10; sensitivity ${URL_SENSITIVITY_MODE}/10).`;
        const heuristicAction = isSpanish
          ? 'No abras este enlace hasta verificar el dominio oficial por un canal confiable.'
          : 'Do not open this link until you verify the official domain through a trusted channel.';

        const existingReasons = Array.isArray(resultObj.topReasons) ? resultObj.topReasons : [];
        const existingActions = Array.isArray(resultObj.actions) ? resultObj.actions : [];
        if (!existingReasons.includes(heuristicReason)) {
          resultObj.topReasons = [heuristicReason, ...existingReasons].slice(0, 4);
        }
        if (!existingActions.includes(heuristicAction)) {
          resultObj.actions = [heuristicAction, ...existingActions].slice(0, 5);
        }
      }
    }
    
    // Attach preview
    resultObj.inputPreview = body.contentStr || body.content;
    resultObj.inputType = body.type;

    return NextResponse.json(resultObj);

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
