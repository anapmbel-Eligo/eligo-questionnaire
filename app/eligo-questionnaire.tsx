'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Save, Eye, BarChart3, Settings } from 'lucide-react';

// Importar Supabase
import { createClient } from '@supabase/supabase-js';

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

interface Participant {
  id?: string;
  createdAt?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  q1_dias: string;
  q2_cambios: string;
  q3_sabeHacer: string;
  q4_enseniar: string;
  q5_pendiente: string;
  q6_confianza: string;
  q7_organiza: string;
  q8_busca: 'gente' | 'construir' | 'aprender' | 'compartir' | '';
  q9_movimiento: 'cualquiera' | 'sentarse' | 'cortas' | 'accesible' | '';
  q10_restricciones: string;
  valores?: string[];
  lifeStage?: string;
  completado: boolean;
}

type TabView = 'cuestionario' | 'dashboard' | 'concierge';

export default function EligoApp() {
  const [currentTab, setCurrentTab] = useState<TabView>('cuestionario');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipantsFromSupabase();
  }, []);

  const loadParticipantsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('completado', true);

      if (error) throw error;

      const mappedData = (data || []).map((row: any) => ({
        id: row.id,
        createdAt: row.created_at,
        nombre: row.nombre,
        email: row.email,
        telefono: row.telefono,
        q1_dias: row.q1_dias || '',
        q2_cambios: row.q2_cambios || '',
        q3_sabeHacer: row.q3_sabeHacer || '',
        q4_enseniar: row.q4_enseniar || '',
        q5_pendiente: row.q5_pendiente || '',
        q6_confianza: row.q6_confianza || '',
        q7_organiza: row.q7_organiza || '',
        q8_busca: row.q8_busca || '',
        q9_movimiento: row.q9_movimiento || '',
        q10_restricciones: row.q10_restricciones || '',
        valores: row.valores || [],
        lifeStage: row.lifeStage,
        completado: true,
      }));

      setParticipants(mappedData);
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const startNewParticipant = () => {
    const newParticipant: Participant = {
      q1_dias: '',
      q2_cambios: '',
      q3_sabeHacer: '',
      q4_enseniar: '',
      q5_pendiente: '',
      q6_confianza: '',
      q7_organiza: '',
      q8_busca: '',
      q9_movimiento: '',
      q10_restricciones: '',
      completado: false,
    };
    setCurrentParticipant(newParticipant);
    setCurrentQuestion(0);
    setShowContactForm(false);
  };

  const saveAndContinue = () => {
    if (!currentParticipant) return;

    if (currentQuestion < 9) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowContactForm(true);
    }
  };

  const saveContact = async (nombre: string, email: string, telefono: string) => {
    if (!currentParticipant) return;

    const completed: Participant = {
      ...currentParticipant,
      nombre,
      email,
      telefono,
      completado: true,
      valores: extractValues(currentParticipant),
      lifeStage: inferLifeStage(currentParticipant),
    };

    try {
      const { error } = await supabase.from('participants').insert([
        {
          nombre: completed.nombre,
          email: completed.email,
          telefono: completed.telefono,
          q1_dias: completed.q1_dias,
          q2_cambios: completed.q2_cambios,
          q3_sabeHacer: completed.q3_sabeHacer,
          q4_enseniar: completed.q4_enseniar,
          q5_pendiente: completed.q5_pendiente,
          q6_confianza: completed.q6_confianza,
          q7_organiza: completed.q7_organiza,
          q8_busca: completed.q8_busca,
          q9_movimiento: completed.q9_movimiento,
          q10_restricciones: completed.q10_restricciones,
          valores: completed.valores,
          lifeStage: completed.lifeStage,
          completado: true,
        },
      ]);

      if (error) throw error;

      await loadParticipantsFromSupabase();

      setCurrentParticipant(null);
      setCurrentQuestion(0);
      setShowContactForm(false);
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      alert('Hubo un error al guardar. Intenta de nuevo.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-700">Cargando...</p>
        </div>
      </div>
    );
  }

  if (currentTab === 'cuestionario' && currentParticipant) {
    return (
      <QuestionnaireView
        participant={currentParticipant}
        setParticipant={setCurrentParticipant}
        currentQuestion={currentQuestion}
        setCurrentQuestion={setCurrentQuestion}
        saveAndContinue={saveAndContinue}
        showContactForm={showContactForm}
        saveContact={saveContact}
        onBack={() => {
          setCurrentParticipant(null);
          setCurrentTab('cuestionario');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      <header className="border-b border-amber-200 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-amber-900">ELIGO</h1>
              <p className="text-sm text-amber-700 mt-1">I choose. Comunidad y pertenencia después de los 60.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentTab('cuestionario')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  currentTab === 'cuestionario'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Cuestionario
              </button>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentTab === 'dashboard'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <BarChart3 size={18} />
                Matching
              </button>
              <button
                onClick={() => setCurrentTab('concierge')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentTab === 'concierge'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                <Settings size={18} />
                Concierge
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {currentTab === 'cuestionario' && (
          <CuestionarioHome
            onStart={startNewParticipant}
            participantCount={participants.length}
            completedCount={participants.length}
          />
        )}
        {currentTab === 'dashboard' && <DashboardView participants={participants} />}
        {currentTab === 'concierge' && <ConciergeView participants={participants} />}
      </main>
    </div>
  );
}

function CuestionarioHome({
  onStart,
  participantCount,
  completedCount,
}: {
  onStart: () => void;
  participantCount: number;
  completedCount: number;
}) {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-white p-8 border border-amber-200">
        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-3">Cuéntanos tu historia</h2>
        <p className="text-amber-800 leading-relaxed mb-4">
          Este cuestionario no tiene respuestas correctas. Solo queremos saber quién eres, qué haces, qué
          sabes, y qué buscas en este momento. Tus respuestas nos ayudan a conectarte con personas que compartan
          algo contigo.
        </p>
        <p className="text-sm text-amber-700 mb-6">
          Toma el tiempo que necesites. Puedes volver en cualquier momento.
        </p>
        <button
          onClick={onStart}
          className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition"
        >
          Empezar
          <ChevronRight size={20} />
        </button>
      </div>

      {participantCount > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-6 border border-amber-200">
            <div className="text-3xl font-bold text-amber-600">{participantCount}</div>
            <p className="text-sm text-amber-800 mt-1">Personas respondieron</p>
          </div>
          <div className="rounded-xl bg-white p-6 border border-amber-200">
            <div className="text-3xl font-bold text-green-600">{completedCount}</div>
            <p className="text-sm text-green-800 mt-1">Completados</p>
          </div>
        </div>
      )}
    </div>
  );
}

const QUESTIONS = [
  {
    id: 'q1',
    num: 1,
    title: '¿Cómo son tus días ahora?',
    subtitle: 'No hay respuesta correcta. Cuéntanos lo que haces normalmente, aunque te parezca poco interesante.',
    placeholder: 'Me levanto temprano, casi siempre...',
    field: 'q1_dias' as const,
  },
  {
    id: 'q2',
    num: 2,
    title: '¿Qué ha cambiado en tu vida en los últimos años?',
    subtitle: 'Puede ser algo grande o algo pequeño. Un trabajo, una casa, una persona, una costumbre.',
    placeholder: 'Hace unos años...',
    field: 'q2_cambios' as const,
  },
  {
    id: 'q3',
    num: 3,
    title: '¿Qué sabes hacer bien?',
    subtitle: 'Algo de tu trabajo, de tu casa, de tus manos, de tratar con la gente. Lo que sea.',
    placeholder: 'Se me da bien...',
    field: 'q3_sabeHacer' as const,
  },
  {
    id: 'q4',
    num: 4,
    title: '¿Hay algo que sabes y que te gustaría que alguien más aprendiera?',
    subtitle: 'Algo que te daría un poco de lástima que se perdiera.',
    placeholder: 'Me gustaría que alguien supiera...',
    field: 'q4_enseniar' as const,
  },
  {
    id: 'q5',
    num: 5,
    title: '¿Hay algo que te quedaste con ganas de hacer?',
    subtitle: 'Puede ser de hace mucho o de hace poco. Algo que sigue ahí.',
    placeholder: 'Siempre quise...',
    field: 'q5_pendiente' as const,
  },
  {
    id: 'q6',
    num: 6,
    title: '¿Piensa en alguien con quien te sientes en confianza. ¿Qué tiene esa persona?',
    subtitle: 'No hace falta decir quién es.',
    placeholder: 'Es alguien que...',
    field: 'q6_confianza' as const,
  },
  {
    id: 'q7',
    num: 7,
    title: '¿Te ha tocado ser la persona que organiza?',
    subtitle: 'Una comida, un viaje, una colecta, un grupo, una fiesta. Sin importar si salió bien.',
    placeholder: 'Sí, una vez... / La verdad no, siempre...',
    field: 'q7_organiza' as const,
  },
  {
    id: 'q8',
    num: 8,
    title: '¿Qué buscas más en este momento?',
    type: 'select',
    field: 'q8_busca' as const,
    options: [
      { value: 'gente', label: 'Gente con quien contar' },
      { value: 'construir', label: 'Construir algo con otros' },
      { value: 'aprender', label: 'Aprender cosas nuevas' },
      { value: 'compartir', label: 'Compartir lo que sé' },
    ],
  },
  {
    id: 'q9',
    num: 9,
    title: '¿Qué tipo de plan te acomoda?',
    subtitle: 'Para no invitarte a algo que no te acomode.',
    type: 'select',
    field: 'q9_movimiento' as const,
    options: [
      { value: 'cualquiera', label: 'Le entro a lo que sea — caminar, subir escaleras, estar de pie un buen rato' },
      { value: 'sentarse', label: 'Camino bien, pero prefiero que haya dónde sentarse' },
      { value: 'cortas', label: 'Distancias cortas y sin muchas escaleras' },
      { value: 'accesible', label: 'Uso bastón, andadera o silla — necesito rampa y baño accesible' },
    ],
  },
  {
    id: 'q10',
    num: 10,
    title: '¿Hay algo que debamos tomar en cuenta para que un plan te funcione?',
    subtitle:
      'Horarios, traslados, alguien a quien cuidas, algo de salud, lo que sea. Puedes saltarte esta.',
    placeholder: 'Los martes no puedo porque... / Después de las seis ya no...',
    field: 'q10_restricciones' as const,
  },
];

function QuestionnaireView({
  participant,
  setParticipant,
  currentQuestion,
  setCurrentQuestion,
  saveAndContinue,
  showContactForm,
  saveContact,
  onBack,
}: any) {
  const q = QUESTIONS[currentQuestion];
  const isAnswered = participant[q.field] || false;

  const handleInputChange = (value: string) => {
    setParticipant({ ...participant, [q.field]: value });
  };

  const handleSelectChange = (value: string) => {
    setParticipant({ ...participant, [q.field]: value });
  };

  if (showContactForm) {
    return (
      <ContactFormView
        onSubmit={saveContact}
        onBack={() => {
          setCurrentQuestion(currentQuestion - 1);
        }}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-amber-700">
            Pregunta {currentQuestion + 1} de {QUESTIONS.length}
          </h2>
          <button
            onClick={onBack}
            className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            Volver
          </button>
        </div>
        <div className="h-1 bg-amber-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-amber-200 mb-6">
        <h3 className="text-2xl font-serif font-bold text-amber-900 mb-2">{q.title}</h3>
        {q.subtitle && <p className="text-amber-700 mb-6">{q.subtitle}</p>}

        {q.type === 'select' ? (
          <div className="space-y-3">
            {q.options.map((option: any) => (
              <button
                key={option.value}
                onClick={() => handleSelectChange(option.value)}
                className={`w-full text-left p-4 rounded-lg border-2 transition font-medium ${
                  participant[q.field] === option.value
                    ? 'border-amber-600 bg-amber-50 text-amber-900'
                    : 'border-amber-200 bg-white text-amber-900 hover:border-amber-400'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={participant[q.field]}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={q.placeholder}
            className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none font-serif text-amber-900 placeholder-amber-400"
            rows={5}
          />
        )}

        {currentQuestion === 9 && (
          <p className="text-xs text-amber-600 mt-3">* Opcional. Puedes dejar esto en blanco.</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            currentQuestion === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <ChevronLeft size={18} />
          Anterior
        </button>

        <div className="text-sm text-amber-600">
          {isAnswered ? (
            <span className="flex items-center gap-1">
              <Save size={16} />
              Guardado
            </span>
          ) : (
            <span>Cuéntanos algo para continuar</span>
          )}
        </div>

        <button
          onClick={saveAndContinue}
          disabled={!isAnswered}
          className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition ${
            isAnswered
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentQuestion === QUESTIONS.length - 1 ? 'Terminar' : 'Siguiente'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function ContactFormView({ onSubmit, onBack }: any) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');

  const canSubmit = nombre.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl p-8 border border-amber-200 mb-6">
        <h3 className="text-2xl font-serif font-bold text-amber-900 mb-2">Casi listo</h3>
        <p className="text-amber-700 mb-6">Cuéntanos cómo podemos contactarte.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="55 1234 5678"
            />
          </div>
        </div>

        <p className="text-xs text-amber-600 mt-6">
          * Requerido. Los otros campos son opcionales. Tus datos se guardan de forma segura y confidencial.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 rounded-lg font-medium text-amber-700 hover:bg-amber-50 border border-amber-200 transition flex items-center gap-2"
        >
          <ChevronLeft size={18} />
          Anterior
        </button>

        <button
          onClick={() => onSubmit(nombre, email, telefono)}
          disabled={!canSubmit}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            canSubmit
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}

interface Match {
  id1: string;
  id2: string;
  name1: string;
  name2: string;
  score: number;
  reasons: string[];
}

function DashboardView({ participants }: { participants: Participant[] }) {
  const completed = participants.filter((p) => p.completado);

  if (completed.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white rounded-2xl p-12 border border-amber-200 inline-block">
          <p className="text-amber-900 text-lg font-serif font-bold mb-2">Invita a Personas a Responder</p>
          <p className="text-amber-700">El dashboard se llenará de vida cuando tengamos cuestionarios completados.</p>
        </div>
      </div>
    );
  }

  const matches = computeMatches(completed);
  const topMatches = matches.sort((a, b) => b.score - a.score).slice(0, 12);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-serif font-bold text-amber-900 mb-2">Compatibilidades Automáticas</h2>
        <p className="text-amber-700 text-lg">
          Personas que están listas para conectar según valores, búsqueda, y momento de vida
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-600 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{completed.length}</div>
          <p className="text-sm text-amber-100 mt-1">Personas respondieron</p>
        </div>
        <div className="bg-blue-500 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">{topMatches.length}</div>
          <p className="text-sm text-blue-100 mt-1">Pares compatibles</p>
        </div>
        <div className="bg-amber-900 text-white rounded-xl p-6 text-center">
          <div className="text-3xl font-bold">
            {topMatches.length > 0 ? Math.round(topMatches[0].score) : '—'}%
          </div>
          <p className="text-sm text-amber-100 mt-1">Compatibilidad máxima</p>
        </div>
      </div>

      {topMatches.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-amber-200 text-center">
          <p className="text-amber-600 font-medium">Necesitamos al menos 2 participantes para calcular compatibilidades.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {topMatches.map((match) => {
            const colors = [
              'bg-red-700',
              'bg-blue-500',
              'bg-amber-900',
            ];
            const scoreIndex = Math.floor(match.score / 30) % 3;
            const bgColor = colors[scoreIndex];
            const textLight = 'text-white';

            return (
              <div
                key={`${match.id1}-${match.id2}`}
                className={`${bgColor} rounded-2xl p-8 shadow-lg hover:shadow-xl transition`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className={`text-2xl font-serif font-bold ${textLight} mb-1`}>
                      {match.name1}
                    </h3>
                    <p className={`${bgColor === 'bg-blue-500' ? 'text-blue-100' : 'text-white/80'} text-sm`}>
                      +
                    </p>
                    <h3 className={`text-2xl font-serif font-bold ${textLight} mt-1`}>
                      {match.name2}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className={`text-4xl font-bold ${textLight}`}>
                      {Math.round(match.score)}%
                    </div>
                    <p className={`text-xs ${bgColor === 'bg-blue-500' ? 'text-blue-100' : 'text-white/70'} mt-1`}>
                      Compatible
                    </p>
                  </div>
                </div>

                <div className={`h-2 rounded-full ${bgColor === 'bg-blue-500' ? 'bg-blue-600' : 'bg-white/30'} mb-6 overflow-hidden`}>
                  <div
                    className={`h-full ${bgColor === 'bg-blue-500' ? 'bg-blue-200' : 'bg-white'}`}
                    style={{ width: `${match.score}%` }}
                  />
                </div>

                <div className="space-y-3">
                  {match.reasons.map((reason, i) => (
                    <div key={i} className="flex gap-3">
                      <span className={`text-lg flex-shrink-0 ${textLight}`}>✓</span>
                      <p className={`text-sm ${textLight} leading-relaxed`}>{reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl p-8 border border-amber-200">
        <h3 className="text-2xl font-serif font-bold text-amber-900 mb-6">
          Quiénes Respondieron ({completed.length})
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {completed.map((p) => (
            <div key={p.id} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 hover:border-amber-400 transition">
              <p className="font-serif font-bold text-amber-900 text-lg">{p.nombre || 'Sin nombre'}</p>
              <p className="text-xs text-amber-700 mt-2">
                <span className="font-medium">Busca:</span> {p.q8_busca}
              </p>
              {p.valores && p.valores.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.valores.map((valor, i) => (
                    <span key={i} className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded-full font-medium">
                      {valor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConciergeView({ participants }: { participants: Participant[] }) {
  const completed = participants.filter((p) => p.completado);

  if (completed.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-amber-700 text-lg">No hay cuestionarios completados todavía.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-8 border border-amber-200">
        <h2 className="text-2xl font-serif font-bold text-amber-900 mb-2">Panel del Concierge</h2>
        <p className="text-amber-700 mb-6">
          Vista operacional. Aquí se registra el Índice de Activación Relacional (IAR) después de la llamada
          diagnóstica, y se asignan playbooks.
        </p>

        <div className="space-y-4">
          {completed.map((p) => (
            <div key={p.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50 hover:bg-amber-100 transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-serif font-bold text-amber-900">{p.nombre || 'Sin nombre'}</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    {p.email || '—'} | {p.telefono || '—'}
                  </p>
                </div>
                <button className="px-3 py-1 bg-amber-600 text-white text-xs font-medium rounded hover:bg-amber-700 transition">
                  <Eye size={14} className="inline mr-1" />
                  Ver perfil
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-amber-200 text-xs text-amber-600">
                <p>Índice de Activación Relacional: <span className="font-medium italic">Pendiente de llamada</span></p>
                <p>Playbook asignado: —</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function extractValues(participant: Participant): string[] {
  const valores: string[] = [];

  if (participant.q4_enseniar && participant.q4_enseniar.length > 10) {
    valores.push('legado');
  }

  if (participant.q5_pendiente && participant.q5_pendiente.length > 10) {
    valores.push('reinvención');
  }

  if (participant.q7_organiza && participant.q7_organiza.toLowerCase().includes('sí')) {
    valores.push('liderazgo');
  }

  if (participant.q8_busca === 'gente') valores.push('pertenencia');
  if (participant.q8_busca === 'construir') valores.push('propósito');
  if (participant.q8_busca === 'aprender') valores.push('crecimiento');
  if (participant.q8_busca === 'compartir') valores.push('contribución');

  return Array.from(new Set(valores));
}

function inferLifeStage(participant: Participant): string {
  const cambiosRecientes = participant.q2_cambios.length > 20;
  const busca = participant.q8_busca;

  if (cambiosRecientes && (busca === 'construir' || busca === 'compartir')) {
    return 'transición_activa';
  }
  if (busca === 'aprender' || busca === 'gente') {
    return 'reactivacion';
  }
  return 'estable';
}

function computeMatches(participants: Participant[]): Match[] {
  const matches: Match[] = [];

  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      const p1 = participants[i];
      const p2 = participants[j];

      const score = calculateMatchScore(p1, p2);
      const reasons = generateMatchReasons(p1, p2);

      if (score > 30) {
        matches.push({
          id1: p1.id || '',
          id2: p2.id || '',
          name1: p1.nombre || 'P' + i,
          name2: p2.nombre || 'P' + j,
          score,
          reasons,
        });
      }
    }
  }

  return matches;
}

function calculateMatchScore(p1: Participant, p2: Participant): number {
  let score = 0;

  const vals1 = p1.valores || [];
  const vals2 = p2.valores || [];
  const sharedVals = vals1.filter((v) => vals2.includes(v)).length;
  score += sharedVals * 15;

  if (
    (p1.q8_busca === 'compartir' && p2.q8_busca === 'aprender') ||
    (p2.q8_busca === 'compartir' && p1.q8_busca === 'aprender')
  ) {
    score += 20;
  }

  if (p1.lifeStage === p2.lifeStage) {
    score += 10;
  }

  const p1LowMobility = ['cortas', 'accesible'].includes(p1.q9_movimiento);
  const p2LowMobility = ['cortas', 'accesible'].includes(p2.q9_movimiento);
  if (p1LowMobility === p2LowMobility) {
    score += 5;
  }

  return Math.min(score, 100);
}

function generateMatchReasons(p1: Participant, p2: Participant): string[] {
  const reasons: string[] = [];

  const vals1 = p1.valores || [];
  const vals2 = p2.valores || [];
  const shared = vals1.filter((v) => vals2.includes(v));

  if (shared.length > 0) {
    reasons.push(`Ambos valoran: ${shared.join(', ')}`);
  }

  if (
    (p1.q8_busca === 'compartir' && p2.q8_busca === 'aprender') ||
    (p2.q8_busca === 'compartir' && p1.q8_busca === 'aprender')
  ) {
    reasons.push(`Uno quiere compartir conocimiento, el otro está interesado en aprender`);
  }

  if (p1.lifeStage === p2.lifeStage && p1.lifeStage) {
    reasons.push(`Similar momento de vida: ${p1.lifeStage.replace('_', ' ')}`);
  }

  return reasons;
}
