export interface XMLTag {
  tagName: string;
  content: string;
  attributes?: Record<string, string>;
  path: string; // XPath-like path to the tag
}

export interface TagMapping {
  id: string;
  sourceTag: string;
  targetTag: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface TextFileMapping {
  id: string;
  fileName: string;
  content: string;
  mappedToTag: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface ParsedXMLData {
  originalNFE: any; // NFE data parsed with current logic
  allTags: XMLTag[]; // All XML tags found
  rawXML: string;
  fileName: string;
}

export interface TagEquivalence {
  id: string;
  primaryTag: string;
  equivalentTags: string[];
  description: string;
  active: boolean;
}