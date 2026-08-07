"use client";

import { useState, useEffect, useCallback } from "react";
import { BottomSheet } from "@/components/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { ItemEstoqueDetalheDTO } from "@/lib/domain";

interface ItemInfoModalProps {
  nomeItem: string;
  nomeUsuario?: string | null;
  onClose: () => void;
}

export function ItemInfoModal({ nomeItem, nomeUsuario, onClose }: ItemInfoModalProps) {
  const [detalhe, setDetalhe] = useState<ItemEstoqueDetalheDTO | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [descricaoEdit, setDescricaoEdit] = useState("");
  const [quantidadeEdit, setQuantidadeEdit] = useState("0");
  const [enderecoEdit, setEnderecoEdit] = useState("");

  const [novoDestino, setNovoDestino] = useState("");
  const [novaObs, setNovaObs] = useState("");
  const [adicionandoRota, setAdicionandoRota] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(nomeItem)}`);
      if (res.ok) {
        const data: ItemEstoqueDetalheDTO = await res.json();
        setDetalhe(data);
        setDescricaoEdit(data.descricao ?? "");
        setQuantidadeEdit(String(data.quantidade));
        setEnderecoEdit(data.endereco ?? "");
      }
    } finally {
      setCarregando(false);
    }
  }, [nomeItem]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(nomeItem)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: descricaoEdit,
          quantidade: quantidadeEdit,
          endereco: enderecoEdit,
          alteradoPor: nomeUsuario ?? "desconhecido",
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível salvar");
        return;
      }
      await carregar();
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarRota() {
    if (!novoDestino.trim()) return;
    setAdicionandoRota(true);
    setErro(null);
    try {
      const res = await fetch(`/api/estoque/${encodeURIComponent(nomeItem)}/rotas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destino: novoDestino, observacao: novaObs, criadaPor: nomeUsuario ?? "desconhecido" }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.erro ?? "Não foi possível adicionar a rota");
        return;
      }
      setNovoDestino("");
      setNovaObs("");
      await carregar();
    } finally {
      setAdicionandoRota(false);
    }
  }

  return (
    <BottomSheet titulo={nomeItem} onClose={onClose}>
      {carregando && <p className="py-6 text-center text-sm text-dim">Carregando...</p>}

      {!carregando && (
        <div className="space-y-4">
          {detalhe && (
            <p className="-mt-2 font-mono text-[11px] text-dim">
              {detalhe.totalSolicitacoes} solicitação(ões) já feita(s) desse item
            </p>
          )}

          {erro && (
            <div className="rounded-lg border border-critical/40 bg-critical/10 px-3 py-2 text-sm text-critical">
              {erro}
            </div>
          )}

          {detalhe?.foto && (
            <img
              src={detalhe.foto}
              alt={nomeItem}
              className="max-h-48 w-full rounded-lg bg-surface-2 object-contain"
            />
          )}

          <div>
            <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
              Descrição
            </label>
            <textarea
              value={descricaoEdit}
              onChange={(e) => setDescricaoEdit(e.target.value)}
              placeholder="O que é esse item, pra que serve..."
              rows={2}
              className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
                Quantidade em estoque
              </label>
              <input
                type="number"
                min={0}
                value={quantidadeEdit}
                onChange={(e) => setQuantidadeEdit(e.target.value)}
                className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-indigo-500/50"
              />
            </div>
            <div>
              <label className="mb-1 block font-mono text-[10.5px] uppercase tracking-wide text-dim">
                Endereço no estoque
              </label>
              <input
                value={enderecoEdit}
                onChange={(e) => setEnderecoEdit(e.target.value)}
                placeholder="ex: D03C02"
                className="w-full rounded-md border border-panel-border bg-surface-2 px-3 py-2 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {detalhe?.ultimoAlteradoPor && (
            <div className="font-mono text-[10.5px] text-dim">
              última alteração por {detalhe.ultimoAlteradoPor}
            </div>
          )}

          <Button variant="primary" size="sm" disabled={salvando} onClick={salvar}>
            {salvando ? "Salvando..." : "Salvar informações"}
          </Button>

          <div className="border-t border-panel-border pt-4">
            <h3 className="mb-2 font-display text-sm font-semibold uppercase tracking-wide text-dim">
              Rotas / destinos
            </h3>

            <div className="mb-2 flex flex-wrap gap-2">
              <input
                value={novoDestino}
                onChange={(e) => setNovoDestino(e.target.value)}
                placeholder="destino (ex: LINHA 3)"
                className="flex-1 rounded-md border border-panel-border bg-surface-2 px-3 py-1.5 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
              />
              <input
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                placeholder="observação (opcional)"
                className="flex-1 rounded-md border border-panel-border bg-surface-2 px-3 py-1.5 text-sm text-ink placeholder:text-muted outline-none focus:border-indigo-500/50"
              />
              <Button
                variant="outline"
                size="sm"
                disabled={adicionandoRota || !novoDestino.trim()}
                onClick={adicionarRota}
              >
                {adicionandoRota ? "..." : "+ Adicionar"}
              </Button>
            </div>

            {(detalhe?.rotas.length ?? 0) === 0 && (
              <p className="text-sm text-dim">Nenhuma rota registrada ainda para esse item.</p>
            )}
            <div className="space-y-1.5">
              {detalhe?.rotas.map((rota) => (
                <div
                  key={rota.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-panel-border bg-surface-2 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm text-ink">{rota.destino}</span>
                      <span className="rounded bg-panel px-1.5 py-0.5 font-mono text-[9px] uppercase text-dim">
                        {rota.automatica ? "entrega" : "manual"}
                      </span>
                    </div>
                    {rota.observacao && <div className="truncate text-xs text-dim">{rota.observacao}</div>}
                  </div>
                  <div className="shrink-0 text-right font-mono text-[10.5px] text-dim">
                    {new Date(rota.criadaEm).toLocaleDateString("pt-BR")}
                    {rota.criadaPor && <div>{rota.criadaPor}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
