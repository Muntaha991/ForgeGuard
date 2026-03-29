import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function downloadReportAsPDF(elementId: string, filename: string = 'Security-Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    alert('Error: Report element not found on the page.');
    return;
  }

  // 1. Create a clone to safely modify (light mode & padding) without touching the real UI
  const clone = element.cloneNode(true) as HTMLElement;
  
  // 2. Set beautiful report padding and a forced white background on the absolute container
  clone.style.padding = '60px 50px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.width = `${element.offsetWidth}px`; // Lock width to prevent layout collapse
  clone.style.boxSizing = 'border-box';
  clone.style.borderRadius = '0px';

  // 3. Systematically override dark mode Tailwind classes on the clone recursively
  const forceLightMode = (node: HTMLElement) => {
    if (node.classList) {
        const classes = Array.from(node.classList);
        classes.forEach(c => {
            // Text Colors
            if (c.includes('text-white') || c.includes('text-gray-200') || c.includes('text-gray-400') || c.includes('text-blue-100')) {
                node.style.color = '#1f2937'; // text-gray-800
            }
            if (c.includes('text-white/80') || c.includes('text-white/90')) {
                node.style.color = '#4b5563'; // text-gray-600
            }
            // Background Colors
            if (c.includes('bg-black') || c.includes('bg-[#06080b]') || c.includes('bg-[#121214]')) {
                node.style.backgroundColor = '#ffffff';
            }
            if (c.includes('bg-[#1E293B]') || c.includes('bg-[#101736]')) {
                node.style.backgroundColor = '#f3f4f6'; // Light gray bubble
            }
            // Borders
            if (c.includes('border-white/5') || c.includes('border-white/10') || c.includes('border-blue-500/10')) {
                node.style.borderColor = '#e5e7eb'; // border-gray-200
                node.style.borderWidth = '1px';
                node.style.borderStyle = 'solid';
            }
            // Shadows
            if (c.includes('shadow-md')) {
                node.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
            }
        });
    }

    // Explicitly fix white text if inline styles exist
    const tag = node.tagName;
    if (['H1', 'H2', 'H3', 'P', 'SPAN', 'STRONG', 'DIV'].includes(tag)) {
        const style = window.getComputedStyle(node);
        // Sometimes computed styles aren't fully resolved on a detached clone, but we try
        if (style.color === 'rgb(255, 255, 255)' || node.style.color === 'rgb(255, 255, 255)') {
            node.style.color = '#1f2937';
        }
    }

    for (let i = 0; i < node.children.length; i++) {
        forceLightMode(node.children[i] as HTMLElement);
    }
  };
  
  forceLightMode(clone);

  // 4. Attach clone to DOM off-screen so `html-to-image` can read its computed layouts
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'absolute';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);
  
  try {
    // Make sure we have enough time for layout shifts
    await new Promise(resolve => setTimeout(resolve, 150));

    // Capture the light-mode styled clone
    const imgData = await toJpeg(clone, {
      quality: 0.98,
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    });

    if (!imgData || imgData === 'data:,') {
      throw new Error('Image rendering failed. The DOM may be hidden or inaccessible.');
    }
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    
    const elementRatio = clone.offsetHeight / clone.offsetWidth;
    const pdfHeight = pdfWidth * elementRatio;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    const isNativePlatform = Capacitor.isNativePlatform();

    if (isNativePlatform) {
      const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
      const normalizedFilename = safeFilename.replace(/\s+/g, '-');
      const filePath = `forgeguard-reports/${Date.now()}-${normalizedFilename}`;
      const pdfBuffer = pdf.output('arraybuffer');
      const pdfBase64 = arrayBufferToBase64(pdfBuffer);
      const shareTitle = 'ForgeGuard Security Report';
      const shareDialogTitle = 'Share PDF Report';
      const canUseShare = Capacitor.isPluginAvailable('Share');

      if (!canUseShare) {
        throw new Error('Share plugin is not available on this device build.');
      }

      // Preferred native flow: write file and share file URI.
      try {
        const savedFile = await Filesystem.writeFile({
          path: filePath,
          data: pdfBase64,
          directory: Directory.Cache,
          recursive: true,
        });

        await Share.share({
          title: shareTitle,
          dialogTitle: shareDialogTitle,
          url: savedFile.uri,
        });
      } catch (filesystemError: any) {
        // Fallback for builds where Filesystem native side isn't linked yet.
        const msg = String(filesystemError?.message || filesystemError || '');
        const pluginNotImplemented = /plugin is not implemented/i.test(msg);

        if (!pluginNotImplemented) {
          throw filesystemError;
        }

        await Share.share({
          title: shareTitle,
          dialogTitle: shareDialogTitle,
          url: `data:application/pdf;base64,${pdfBase64}`,
        });
      }
    } else {
      pdf.save(filename);
    }
  } catch (error: any) {
    console.error('Failed to generate PDF:', error);
    const rawMessage = String(error?.message || error || 'Unknown error');
    if (/plugin is not implemented/i.test(rawMessage)) {
      alert('Failed to generate PDF Report. Native plugin is not linked in this app build. Rebuild the iOS app after running: npx cap sync ios');
    } else {
      alert(`Failed to generate PDF Report. Reason: ${rawMessage}`);
    }
  } finally {
    // Always clean up the offscreen container
    document.body.removeChild(offscreenContainer);
  }
}
