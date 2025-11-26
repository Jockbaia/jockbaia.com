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
  return content.replace(
    /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/g,
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

function splitParagraphs(content: string): string {
  const htmlParts = content.split(/\n\s*\n/).map((block) => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<figure') || trimmed.startsWith('<a href')) {
      return trimmed;
    }
    return `<p>${trimmed}</p>`;
  });
  return htmlParts.join('');
}

export async function convertMarkdownToHtml(content: string): Promise<string> {
  let processedContent = handleImagesWithDescriptions(content);
  processedContent = handleOtherImages(processedContent);
  processedContent = handleYouTubeLinks(processedContent);
  return splitParagraphs(processedContent);
}
