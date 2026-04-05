import React from 'react';
import { Order, StoreConfig } from '../types';
import { formatPrice } from '../lib/utils';

interface ContentDeclarationProps {
  order: Order;
  storeConfig: StoreConfig;
}

export const ContentDeclaration: React.FC<ContentDeclarationProps> = ({ order, storeConfig }) => {
  const parseAddress = (addr: string) => {
    // Expected format: "Street, Number, Neighborhood, City - UF, CEP"
    const parts = addr.split(',').map(p => p.trim());
    const cityState = parts[3]?.split('-').map(s => s.trim()) || [];
    return {
      street: parts[0] || '',
      number: parts[1] || '',
      neighborhood: parts[2] || '',
      city: cityState[0] || '',
      uf: cityState[1] || '',
      cep: parts[4] || ''
    };
  };

  const senderAddr = parseAddress(storeConfig.address);
  const recipientAddr = parseAddress(order.customer.address);

  const DeclarationCopy = () => (
    <div className="declaration-copy border-2 border-black p-6 bg-white text-black font-sans leading-tight">
      <div className="text-center font-bold text-xl border-b-2 border-black pb-3 mb-4">
        DECLARAÇÃO DE CONTEÚDO
      </div>

      <div className="grid grid-cols-2 border-2 border-black mb-4">
        <div className="border-r-2 border-black">
          <div className="font-bold text-[11px] bg-gray-100 px-3 py-1 border-b-2 border-black uppercase">Remetente</div>
          <div className="p-3 space-y-2 text-[10px]">
            <p><span className="font-bold">NOME:</span> {storeConfig.name}</p>
            <p><span className="font-bold">ENDEREÇO:</span> {storeConfig.address}</p>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-bold">CIDADE:</span> {senderAddr.city}</p>
              <p><span className="font-bold">UF:</span> {senderAddr.uf}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-bold">CEP:</span> {senderAddr.cep}</p>
              <p><span className="font-bold">CPF/CNPJ:</span> </p>
            </div>
          </div>
        </div>
        <div>
          <div className="font-bold text-[11px] bg-gray-100 px-3 py-1 border-b-2 border-black uppercase">Destinatário</div>
          <div className="p-3 space-y-2 text-[10px]">
            <p><span className="font-bold">NOME:</span> {order.customer.name}</p>
            <p><span className="font-bold">ENDEREÇO:</span> {order.customer.address}</p>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-bold">CIDADE:</span> {recipientAddr.city}</p>
              <p><span className="font-bold">UF:</span> {recipientAddr.uf}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p><span className="font-bold">CEP:</span> {recipientAddr.cep}</p>
              <p><span className="font-bold">CPF/CNPJ:</span> {order.customer.cpf || ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="font-bold text-[11px] bg-gray-100 px-3 py-1 border-2 border-black text-center uppercase">Identificação dos Bens</div>
        <table className="w-full border-collapse border-x-2 border-b-2 border-black text-[10px]">
          <thead>
            <tr className="bg-gray-50 font-bold">
              <th className="border-r-2 border-black p-2 w-16 text-center">ITEM</th>
              <th className="border-r-2 border-black p-2 text-left">CONTEÚDO</th>
              <th className="border-r-2 border-black p-2 w-28 text-center">QUANTIDADE</th>
              <th className="p-2 w-28 text-right">VALOR</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, idx) => (
              <tr key={idx} className="border-t-2 border-black">
                <td className="border-r-2 border-black p-2 text-center">{idx + 1}</td>
                <td className="border-r-2 border-black p-2">{item.name}</td>
                <td className="border-r-2 border-black p-2 text-center">{item.quantity}</td>
                <td className="p-2 text-right">{formatPrice(item.price)}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 6 - order.items.length))].map((_, i) => (
              <tr key={`empty-${i}`} className="border-t-2 border-black h-8">
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td className="border-r-2 border-black"></td>
                <td></td>
              </tr>
            ))}
            <tr className="border-t-2 border-black font-bold bg-gray-50">
              <td colSpan={2} className="border-r-2 border-black p-2 text-right uppercase">Totais</td>
              <td className="border-r-2 border-black p-2 text-center">{order.items.reduce((acc, item) => acc + item.quantity, 0)}</td>
              <td className="p-2 text-right">{formatPrice(order.total)}</td>
            </tr>
            <tr className="border-t-2 border-black">
              <td colSpan={4} className="p-2">
                <span className="font-bold">PESO TOTAL (Kg):</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="border-2 border-black p-4 mb-4">
        <div className="font-bold text-[11px] text-center mb-3 uppercase">Declaração</div>
        <p className="text-[9.5px] text-justify leading-relaxed mb-3">
          Declaro que não me enquadro no conceito de contribuinte previsto no art. 4º da Lei Complementar nº 87/1996, uma vez que não realizo, com habitualidade ou em volume que caracterize intuito comercial, operações de circulação de mercadoria, ainda que se iniciem no exterior, ou estou dispensado da emissão da nota fiscal por força da legislação tributária vigente, responsabilizando-me, nos termos da lei e a quem de direito, por informações inverídicas.
        </p>
        <p className="text-[9.5px] text-justify leading-relaxed mb-6">
          Declaro ainda que não estou postando conteúdo inflamável, explosivo, causador de combustão espontânea, tóxico, corrosivo, gás ou qualquer outro conteúdo que constitua perigo, conforme o art. 13 da Lei Postal nº 6.538/78.
        </p>
        
        <div className="flex justify-between items-end mt-10">
          <div className="text-[10px] font-medium">
            ________________, ____ de ____________ de _______
          </div>
          <div className="w-72 text-center">
            <div className="border-t border-black pt-2 text-[10px] font-bold uppercase">
              Assinatura do Declarante/Remetente
            </div>
          </div>
        </div>
      </div>

      <div className="text-[9px] italic leading-tight">
        <span className="font-bold">OBSERVAÇÃO:</span> Constitui crime contra a ordem tributária suprimir ou reduzir tributo, ou contribuição social de qualquer acessório (Lei 8.137/90 Art. 1, V).
      </div>
    </div>
  );

  return (
    <div className="bg-white p-0 text-black max-w-[21cm] mx-auto" id="declaration-print-area">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; visibility: hidden !important; }
          #declaration-print-area, #declaration-print-area * { visibility: visible !important; }
          #declaration-print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 210mm !important; 
            height: auto !important;
            padding: 10mm !important;
            margin: 0 !important;
            z-index: 99999 !important;
            background: white !important;
            display: block !important;
          }
          .no-print { display: none !important; }
          .declaration-copy { page-break-inside: avoid; }
        }
      `}} />

      <div className="flex flex-col gap-16">
        <DeclarationCopy />
        <div className="border-t-2 border-dashed border-gray-300 my-4 no-print flex items-center justify-center relative">
          <span className="absolute bg-white px-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Corte Aqui</span>
        </div>
        <DeclarationCopy />
      </div>
    </div>
  );
};
