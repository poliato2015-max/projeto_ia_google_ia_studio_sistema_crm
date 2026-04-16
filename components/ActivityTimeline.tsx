'use client';

import Image from 'next/image';

const activities = [
  { 
    id: 1, 
    user: 'Sarah Jensen', 
    action: 'fechou o negócio', 
    target: 'Nebula Phase II', 
    value: '+R$ 45.000', 
    time: '10 MINUTOS ATRÁS',
    type: 'success' 
  },
  { 
    id: 2, 
    user: 'David Chen', 
    action: 'Novo lead de alta intenção detectado via', 
    target: 'Intercom', 
    image: 'https://picsum.photos/seed/lead1/100/100',
    company: 'TechFlow Inc',
    time: '2 HORAS ATRÁS',
    type: 'neutral' 
  },
  { 
    id: 3, 
    user: 'Equipe de Mid-Market', 
    action: 'Meta trimestral atingida pela', 
    time: '4 HORAS ATRÁS',
    type: 'neutral' 
  },
];

export function ActivityTimeline() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/10 shadow-sm overflow-hidden h-full">
      <h3 className="text-lg font-bold font-headline text-on-surface mb-8">Atividades em Tempo Real</h3>
      
      <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant/30">
        {activities.map((act) => (
          <div key={act.id} className="relative">
            <div className={cn(
              "absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface-container-lowest",
              act.type === 'success' ? "bg-primary" : "bg-outline-variant"
            )} />
            
            <div className={cn(
              "text-[9px] font-black mb-1",
              act.type === 'success' ? "text-primary" : "text-on-surface-variant/50"
            )}>
              {act.time}
            </div>
            
            <p className="text-sm text-on-surface leading-snug">
              {act.type === 'success' ? (
                <>
                  <span className="font-bold underline">{act.user}</span> {act.action} {' '}
                  <span className="text-primary font-bold underline cursor-pointer">{act.target}</span>
                </>
              ) : (
                <>
                  {act.action} <span className="font-bold">{act.target || act.user}</span>
                </>
              )}
            </p>
            
            {act.value && <p className="text-xs text-primary mt-1 font-black">{act.value}</p>}
            
            {act.image && (
              <div className="mt-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden relative border border-outline-variant/10">
                  <Image 
                    src={act.image} 
                    alt={act.user} 
                    fill 
                    className="object-cover" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant">{act.user} • {act.company}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
