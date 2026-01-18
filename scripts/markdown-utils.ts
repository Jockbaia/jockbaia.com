function handleImagesWithDescriptions(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\((\/i\/[^\)]+)\)\s*\n\*([^\*]+)\*/g,
    (match, altText, imagePath, description) => {
      const mdImagePath = imagePath
        .replace('/i/', '/i/md/')
        .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return `<figure>
                <a href="${imagePath}" target="_blank" rel="noopener noreferrer">
                  <img src="${mdImagePath}" alt="${altText}" />
                </a>
                <figcaption><em>${description.trim()}</em></figcaption>
              </figure>`;
    }
  );
}

function handleOtherImages(content: string): string {
  return content.replace(
    /!\[([^\]]*)\]\((\/i\/[^\)]+)\)/g,
    (match, altText, imagePath) => {
      const mdImagePath = imagePath
        .replace('/i/', '/i/md/')
        .replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return `<a href="${imagePath}" target="_blank" rel="noopener noreferrer">
                <img src="${mdImagePath}" alt="${altText}" />
              </a>`;
    }
  );
}

function handleYouTubeLinks(content: string): string {
  // Only embed bare YouTube URLs; leave Markdown-style links ([text](url)) alone
  // Only embed bare YouTube URLs that are NOT inside parentheses (so
  // Markdown links like [text](https://...) remain untouched).
  return content.replace(
    /(?<!\()https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
    (match, videoId) => {
      return `<iframe 
        style="border: none; width: 100%; aspect-ratio: 16 / 9" 
        src="https://www.youtube.com/embed/${videoId}" 
        title="YouTube video player" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen>
      </iframe>`;
    }
  );
}

function handleLinks(content: string): string {
  return content.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (match, text, url) => {
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    }
  );
}

function splitParagraphs(content: string): string {
  const blocks = content.split(/\n\s*\n/);
  const htmlParts: string[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('<figure') || trimmed.startsWith('<a href')) {
      htmlParts.push(trimmed);
      continue;
    }

    // Group adjacent blockquote blocks so blank lines inside quotes
    // become paragraph breaks within the same <blockquote>.
    if (trimmed.startsWith('>')) {
      const quoteBlocks: string[] = [];
      let j = i;
      while (j < blocks.length && blocks[j].trim().startsWith('>')) {
        quoteBlocks.push(blocks[j]);
        j++;
      }
      i = j - 1;

      const combined = quoteBlocks.join('\n\n');
      const lines = combined.split('\n').map((l) => l.replace(/^\s*>\s?/, ''));

      const paraHtml: string[] = [];
      let currLines: string[] = [];
      for (const line of lines) {
        if (line.trim() === '') {
          if (currLines.length > 0) {
            paraHtml.push(`<p>${currLines.join('<br/>')}</p>`);
            currLines = [];
          }
          // represent an explicit blank paragraph between quoted paragraphs
          paraHtml.push('<p>&nbsp;</p>');
        } else {
          currLines.push(line.trim());
        }
      }
      if (currLines.length > 0) {
        paraHtml.push(`<p>${currLines.join('<br/>')}</p>`);
      }

      const innerHtml = paraHtml.join('');
      if (innerHtml.trim()) {
        htmlParts.push(`<blockquote>${innerHtml}</blockquote>`);
      }
      continue;
    }

    htmlParts.push(`<p>${trimmed}</p>`);
  }

  let html = htmlParts.join('');
  return html;
}

export async function convertMarkdownToHtml(content: string): Promise<string> {
  let processedContent = handleImagesWithDescriptions(content);
  processedContent = handleOtherImages(processedContent);
  processedContent = handleYouTubeLinks(processedContent);
  processedContent = handleLinks(processedContent);
  return splitParagraphs(processedContent);
}
