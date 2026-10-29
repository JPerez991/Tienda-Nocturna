import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import type { AdminQuestion } from "../../lib/types";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { ErrorState, Spinner } from "../../components/ui/States";

/* ============================================================
   Admin › Preguntas — responde dudas de clientes.
   Usa PATCH /api/admin/questions/:id (en el contrato).
   El listado GET /api/admin/questions está SOLICITADO en las
   notas del contrato; si devuelve 404, mostramos aviso claro.
   ============================================================ */

export function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [noDisponible, setNoDisponible] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [respondiendo, setRespondiendo] = useState<string | null>(null);
  const [respuesta, setRespuesta] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setNoDisponible(false);
    api.admin
      .questions()
      .then((r) => {
        if (!cancelled) setQuestions(r);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && e.statusCode === 404) {
          // Endpoint aún no implementado (ver nota en api-contract.md).
          setNoDisponible(true);
          setQuestions([]);
        } else {
          setError(e instanceof Error ? e.message : "Error desconocido");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function responder(q: AdminQuestion) {
    if (!respuesta.trim()) return;
    setGuardando(true);
    setMsg(null);
    try {
      await api.admin.answerQuestion(q.id, respuesta.trim());
      setMsg("✓ Respuesta enviada.");
      setRespondiendo(null);
      setRespuesta("");
      setReloadKey((k) => k + 1);
    } catch (e) {
      setMsg(
        e instanceof ApiError ? e.message : "No pudimos enviar la respuesta.",
      );
    } finally {
      setGuardando(false);
    }
  }

  if (error) return <ErrorState message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  if (questions === null) return <Spinner label="Cargando preguntas…" />;

  return (
    <>
      {noDisponible && (
        <p className="mb-5  bg-acento-fondo px-4 py-3 text-sm text-vino">
          El listado de preguntas aún no está disponible en la API
          (GET /api/admin/questions). Esta pantalla empezará a funcionar en
          cuanto el backend lo implemente; no hay que cambiar código.
        </p>
      )}

      {msg && (
        <p
          role="status"
          className={`mb-4  px-4 py-3 text-sm ${
            msg.startsWith("✓") ? "bg-tinta/10 text-tinta" : "bg-vino/10 text-vino"
          }`}
        >
          {msg}
        </p>
      )}

      {questions.length === 0 ? (
        <p className=" border border-dashed border-tibio/30 bg-white/60 px-6 py-14 text-center text-tibio">
          No hay preguntas pendientes.
        </p>
      ) : (
        <ul className="space-y-4">
          {questions.map((q) => {
            const pendiente = !q.answer && q.status !== "ANSWERED";
            return (
              <li
                key={q.id}
                className=" border border-carbon/5 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-tibio">
                      Sobre{" "}
                      <span className="font-semibold text-carbon">
                        {q.product.name}
                      </span>
                      {q.user?.firstName && <> · de {q.user.firstName}</>}
                    </p>
                    <p className="mt-1 text-carbon">“{q.question}”</p>
                  </div>
                  <Badge tone={pendiente ? "warning" : "success"}>
                    {pendiente ? "Pendiente" : "Respondida"}
                  </Badge>
                </div>

                {q.answer && (
                  <p className="mt-3  bg-tinta/5 px-4 py-3 text-sm text-carbon">
                    <span className="font-semibold text-tinta">Respuesta:</span>{" "}
                    {q.answer}
                  </p>
                )}

                {pendiente && (
                  <div className="mt-4">
                    {respondiendo === q.id ? (
                      <div className="space-y-3">
                        <label
                          htmlFor={`resp-${q.id}`}
                          className="sr-only"
                        >
                          Tu respuesta
                        </label>
                        <textarea
                          id={`resp-${q.id}`}
                          value={respuesta}
                          onChange={(e) => setRespuesta(e.target.value)}
                          rows={3}
                          autoFocus
                          placeholder="Escribe tu respuesta…"
                          className="w-full  border border-tibio/30 bg-white px-4 py-3 text-carbon"
                        />
                        <div className="flex gap-3">
                          <Button
                            size="sm"
                            onClick={() => void responder(q)}
                            loading={guardando}
                            disabled={!respuesta.trim()}
                          >
                            Enviar respuesta
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setRespondiendo(null);
                              setRespuesta("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setRespondiendo(q.id);
                          setRespuesta("");
                        }}
                      >
                        Responder
                      </Button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
