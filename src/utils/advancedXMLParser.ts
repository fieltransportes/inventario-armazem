import { XMLTag, ParsedXMLData, TagEquivalence } from '../types/tagMapping';
import { parseNFEXML } from './nfeParser';

export const extractAllXMLTags = (xmlContent: string): XMLTag[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  const tags: XMLTag[] = [];

  const traverseElement = (element: Element, path: string = '') => {
    const currentPath = path ? `${path}/${element.tagName}` : element.tagName;
    
    // Get attributes
    const attributes: Record<string, string> = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      attributes[attr.name] = attr.value;
    }

    // If element has only text content (no child elements), add as tag
    const hasChildElements = Array.from(element.children).length > 0;
    if (!hasChildElements && element.textContent?.trim()) {
      tags.push({
        tagName: element.tagName,
        content: element.textContent.trim(),
        attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
        path: currentPath
      });
    }

    // Recursively process child elements
    Array.from(element.children).forEach(child => {
      traverseElement(child, currentPath);
    });
  };

  // Start traversal from root element
  if (xmlDoc.documentElement) {
    traverseElement(xmlDoc.documentElement);
  }

  return tags;
};

export const parseAdvancedXML = (xmlContent: string, fileName: string): ParsedXMLData => {
  try {
    // Parse with original NFE parser
    const originalNFE = parseNFEXML(xmlContent, fileName);
    
    // Extract all tags
    const allTags = extractAllXMLTags(xmlContent);
    
    return {
      originalNFE,
      allTags,
      rawXML: xmlContent,
      fileName
    };
  } catch (error) {
    console.error('Error in advanced XML parsing:', error);
    throw error;
  }
};

export const applyTagEquivalences = (
  tags: XMLTag[], 
  tagEquivalences: TagEquivalence[]
): XMLTag[] => {
  const equivalenceMap = new Map<string, string>();
  
  // Build equivalence map
  tagEquivalences.forEach(equiv => {
    if (equiv.active) {
      equiv.equivalentTags.forEach(tag => {
        equivalenceMap.set(tag, equiv.primaryTag);
      });
    }
  });

  // Apply equivalences
  return tags.map(tag => {
    const primaryTag = equivalenceMap.get(tag.tagName);
    if (primaryTag) {
      return {
        ...tag,
        tagName: primaryTag
      };
    }
    return tag;
  });
};

export const parseTXTFile = (content: string, fileName: string): string[] => {
  // Simple TXT parsing - split by lines and filter empty lines
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
};

export const searchTagsByName = (tags: XMLTag[], searchTerm: string): XMLTag[] => {
  const term = searchTerm.toLowerCase();
  return tags.filter(tag => 
    tag.tagName.toLowerCase().includes(term) ||
    tag.content.toLowerCase().includes(term) ||
    tag.path.toLowerCase().includes(term)
  );
};

export const getUniqueTagNames = (tags: XMLTag[]): string[] => {
  const uniqueNames = new Set(tags.map(tag => tag.tagName));
  return Array.from(uniqueNames).sort();
};