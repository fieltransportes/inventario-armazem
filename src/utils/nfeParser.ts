import { NFEData, NFEProduct, NFESeller, NFEBuyer } from '../types/nfe';
import { extractOrderNumber } from './supplierConfig';

export const parseNFEXML = (xmlContent: string, fileName: string): NFEData => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
  
  // Check for parsing errors
  const parserError = xmlDoc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML format');
  }

  // Helper function to get text content safely
  const getTextContent = (selector: string, parent: Element | Document = xmlDoc): string => {
    const element = parent.querySelector(selector);
    return element?.textContent?.trim() || '';
  };

  // Helper function to get number safely
  const getNumber = (selector: string, parent: Element | Document = xmlDoc): number => {
    const text = getTextContent(selector, parent);
    return parseFloat(text) || 0;
  };

  try {
    // Extract NFE key (chNFe) - try multiple possible locations
    let chNFe = getTextContent('chNFe');
    if (!chNFe) {
      chNFe = getTextContent('infNFe chNFe');
    }
    if (!chNFe) {
      // Try to get from infNFe Id attribute
      const infNFeElement = xmlDoc.querySelector('infNFe');
      if (infNFeElement) {
        const idAttr = infNFeElement.getAttribute('Id');
        if (idAttr && idAttr.startsWith('NFe')) {
          chNFe = idAttr.substring(3); // Remove 'NFe' prefix
        }
      }
    }
    
    console.log('Extracted chNFe:', chNFe);
    
    if (!chNFe || chNFe.length !== 44) {
      throw new Error('NFE key (chNFe) not found or invalid in XML. Expected 44 characters.');
    }

    // Extract basic NFE info
    const ideElement = xmlDoc.querySelector('ide');
    const nfeNumber = getTextContent('nNF', ideElement);
    const series = getTextContent('serie', ideElement);
    const issueDate = getTextContent('dhEmi', ideElement);

    // Extract seller info (emit)
    const emitElement = xmlDoc.querySelector('emit');
    const seller: NFESeller = {
      cnpj: getTextContent('CNPJ', emitElement),
      name: getTextContent('xNome', emitElement),
      fantasyName: getTextContent('xFant', emitElement),
      address: {
        street: getTextContent('xLgr', emitElement),
        number: getTextContent('nro', emitElement),
        neighborhood: getTextContent('xBairro', emitElement),
        city: getTextContent('xMun', emitElement),
        state: getTextContent('UF', emitElement),
        zipCode: getTextContent('CEP', emitElement),
      },
      email: getTextContent('email', emitElement),
      phone: getTextContent('fone', emitElement),
    };

    // Extract buyer info (dest)
    const destElement = xmlDoc.querySelector('dest');
    const buyer: NFEBuyer = {
      cnpj: getTextContent('CNPJ', destElement),
      cpf: getTextContent('CPF', destElement),
      name: getTextContent('xNome', destElement),
      address: {
        street: getTextContent('xLgr', destElement),
        number: getTextContent('nro', destElement),
        neighborhood: getTextContent('xBairro', destElement),
        city: getTextContent('xMun', destElement),
        state: getTextContent('UF', destElement),
        zipCode: getTextContent('CEP', destElement),
      },
    };

    // Extract products
    const detElements = xmlDoc.querySelectorAll('det');
    const products: NFEProduct[] = Array.from(detElements).map((det, index) => {
      const prodElement = det.querySelector('prod');
      const productCode = getTextContent('cProd', prodElement); // Extrai o código do produto da tag <cProd>
      return {
        id: productCode || `${nfeNumber}-${index + 1}`, // Usa cProd como ID, fallback para o antigo formato
        name: getTextContent('xProd', prodElement),
        quantity: getNumber('qCom', prodElement),
        unitPrice: getNumber('vUnCom', prodElement),
        totalPrice: getNumber('vProd', prodElement),
        unit: getTextContent('uCom', prodElement),
        ncm: getTextContent('NCM', prodElement),
        cfop: getTextContent('CFOP', prodElement),
        // Adicionar campos para cadastro de produtos
        code: productCode,
        ean_box: getTextContent('cEAN', prodElement),
        ean_unit: getTextContent('cEANTrib', prodElement),
      };
    });

    // Extract totals
    const totalElement = xmlDoc.querySelector('total ICMSTot');
    const totalValue = getNumber('vNF', totalElement);

    const taxes = {
      icms: getNumber('vICMS', totalElement),
      ipi: getNumber('vIPI', totalElement),
      pis: getNumber('vPIS', totalElement),
      cofins: getNumber('vCOFINS', totalElement),
    };

    // Extract pedido/DT from configured tags
    const xmlData = {
      infCpl: getTextContent('infCpl'),
      xPed: getTextContent('xPed'),
      infAdFisco: getTextContent('infAdFisco'),
      infAdic: getTextContent('infAdic'),
      obs: getTextContent('obs')
    };
    
    const pedidoDT = extractOrderNumber(xmlData, seller.cnpj);
    
    console.log('Extracted xmlData:', xmlData);
    console.log('Extracted pedidoDT:', pedidoDT);

    const nfeData: NFEData = {
      id: `${nfeNumber}-${Date.now()}`,
      chNFe,
      number: nfeNumber,
      series,
      issueDate,
      seller,
      buyer,
      products,
      totalValue,
      taxes,
      status: 'imported',
      importedAt: new Date().toISOString(),
      fileName,
      pedidoDT: pedidoDT || undefined,
    };

    return nfeData;
  } catch (error) {
    console.error('Error parsing NFE XML:', error);
    throw new Error('Failed to parse NFE XML. Please check the file format.');
  }
};
