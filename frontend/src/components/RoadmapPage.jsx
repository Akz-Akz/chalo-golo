import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Lock, Play, BookOpen, Video, Code2, ExternalLink, ChevronDown, ChevronUp, Zap, Target, Sparkles } from 'lucide-react';

const phaseColors = ['#5b47e0', '#0284c7', '#7c3aed', '#059669', '#d97706'];

export default function RoadmapPage({ thought, onBack, userProfile }) {
  const [expandedPhase, setExpandedPhase] = useState(0);
  const data = thought?.roadmap;
  const phases = Array.isArray(data?.phases) ? data.phases : [];
  const resources = Array.isArray(data?.resources) ? data.resources : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const completedModules = phases.flatMap((phase) => phase.modules || []).filter((module) => module.done).length;
  const totalModules = phases.flatMap((phase) => phase.modules || []).length;

  if (!data) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7f4' }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Roadmap unavailable</div>
          <button onClick={onBack} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #e5e5e5', background: '#fff', cursor: 'pointer' }}>Go back</button>
        </div>
      </div>
    );
  }

  const statusIcon = (status) => {
    if (status === 'active') return <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#5b47e0', boxShadow: '0 0 0 3px rgba(75,54,204,0.2)' }} />;
    if (status === 'locked') return <Lock size={14} color="#9ca3af" />;
    return <CheckCircle size={14} color="#065f46" />;
  };

  const resourceIcon = (type) => {
    if (type === 'Video' || type === 'YouTube') return <Video size={14} />;
    if (type === 'Project') return <Code2 size={14} />;
    return <BookOpen size={14} />;
  };

  const openUrl = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1.5px solid #e5e5e5', background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#5f5f5f', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#1f1f1f' }}>
            {thought?.goal || 'Personalized roadmap'}
          </div>
          <div style={{ fontSize: 13, color: '#5f5f5f' }}>
            {data.domainLabel} • {data.totalWeeks || 0} weeks estimated
          </div>
        </div>
        <div style={{ background: '#d1fae5', color: '#065f46', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
          Reality-Checked {data.realityCheck?.score ? `${data.realityCheck.score}/100` : ''}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div>
          <div style={{ background: '#fff', borderRadius: 20, padding: '28px 32px', marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#1f1f1f', marginBottom: 20 }}>Your path to the goal</div>
            <div style={{ display: 'flex', gap: 0, position: 'relative' }}>
              {phases.map((phase, index) => {
                const color = phaseColors[index % phaseColors.length];
                return (
                  <div key={`${phase.name}-${index}`} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ height: 8, background: phase.status === 'active' ? color : phase.status === 'done' ? color : '#e5e5e5', borderRadius: index === 0 ? '8px 0 0 8px' : index === phases.length - 1 ? '0 8px 8px 0' : 0, marginBottom: 10, position: 'relative' }}>
                      {phase.status === 'active' && (
                        <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, borderRadius: '50%', background: color, border: '3px solid #fff', boxShadow: `0 0 0 3px ${color}40` }} />
                      )}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: phase.status === 'active' ? color : '#9ca3af' }}>{phase.name}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>{phase.duration}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {phases.map((phase, phaseIndex) => {
            const color = phaseColors[phaseIndex % phaseColors.length];
            const totalHours = (phase.modules || []).reduce((sum, module) => sum + module.hours, 0);

            return (
              <div key={`${phase.name}-${phaseIndex}`} style={{ background: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: expandedPhase === phaseIndex ? `2px solid ${color}` : '2px solid transparent', transition: 'border 0.2s' }}>
                <button onClick={() => setExpandedPhase(expandedPhase === phaseIndex ? -1 : phaseIndex)} style={{
                  width: '100%', padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16,
                  background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left'
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {statusIcon(phase.status)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 16, color: '#1f1f1f' }}>Phase {phaseIndex + 1}: {phase.name}</span>
                      {phase.status === 'active' ? <span style={{ background: `${color}20`, color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>IN PROGRESS</span> : null}
                      {phase.status === 'locked' ? <span style={{ background: '#f8f7f4', color: '#9ca3af', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>LOCKED</span> : null}
                    </div>
                    <div style={{ fontSize: 13, color: '#5f5f5f' }}>{phase.duration} • {(phase.modules || []).length} modules • {totalHours} hours total</div>
                  </div>
                  {expandedPhase === phaseIndex ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                </button>

                {expandedPhase === phaseIndex && (
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '0 28px 20px' }}>
                    {(phase.modules || []).map((module, moduleIndex) => (
                      <div key={`${module.title}-${moduleIndex}`} style={{
                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0',
                        borderBottom: moduleIndex < (phase.modules || []).length - 1 ? '1px solid #f9f9f9' : 'none'
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: module.done ? '#d1fae5' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {module.done ? <CheckCircle size={16} color="#065f46" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#d1d5db' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, color: '#1f1f1f', marginBottom: 3 }}>{module.title}</div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, color: '#5f5f5f', flexWrap: 'wrap' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{resourceIcon(module.type)} {module.type}</span>
                            <span>•</span>
                            <span>{module.hours} hrs</span>
                            <span>•</span>
                            {module.url ? (
                              <a href={module.url} target="_blank" rel="noreferrer" style={{ color: '#5b47e0', textDecoration: 'none' }}>
                                {module.platform || module.resource || 'Open resource'}
                              </a>
                            ) : (
                              <span style={{ color: '#5b47e0' }}>{module.platform || module.resource || 'Self-guided'}</span>
                            )}
                          </div>
                        </div>
                        {phase.status !== 'locked' ? (
                          <button
                            onClick={() => openUrl(module.url)}
                            disabled={!module.url}
                            style={{
                              padding: '8px 14px', borderRadius: 8, border: '1.5px solid #e5e5e5',
                              background: module.done ? '#f3f4f6' : '#fff', fontSize: 13, fontWeight: 600,
                              cursor: module.url ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 6,
                              color: module.done ? '#5f5f5f' : '#5b47e0', opacity: module.url ? 1 : 0.55
                            }}
                          >
                            {module.done ? 'Review' : <><Play size={12} /> Start</>}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f', marginBottom: 16 }}>Your stats</div>
            {[
              ['Estimated weeks', `${data.totalWeeks || 0} weeks`],
              ['Total study hours', `${data.totalHours || 0} hrs`],
              ['Weekly commitment', userProfile?.weeklyHours || `${data.weeklyHours || 5} hrs`],
              ['Modules completed', `${completedModules} / ${totalModules}`]
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#5f5f5f' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#1f1f1f' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: '6px', display: 'flex', alignItems: 'center' }}>
                <Target size={14} color="#d97706" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f' }}>Reality check</div>
            </div>
            <div style={{ fontSize: 13, color: '#5f5f5f', lineHeight: 1.6, marginBottom: 10 }}>
              {data.realityCheck?.timelineGap?.message || 'Your roadmap has already been calibrated against your timeline and weekly bandwidth.'}
            </div>
            <div style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: 999, background: data.realityCheck?.verdictBg || '#fef3c7', color: data.realityCheck?.verdictColor || '#d97706', fontSize: 12, fontWeight: 700 }}>
              {data.realityCheck?.verdict || 'Feasible with adjustments'}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f' }}>Top resources</div>
              {data?._source === 'ai-enriched' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, background: 'linear-gradient(135deg, #ede9ff, #ddd6fe)', color: '#5b47e0', padding: '3px 8px', borderRadius: 10, fontWeight: 700 }}>
                  <Sparkles size={10} /> AI ENRICHED
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
              {data?._source === 'ai-enriched' ? 'AI-suggested specifically for your goal' : 'Curated to your goal and learning style'}
            </div>
            {resources.map((resource, index) => (
              <div key={`${resource.title}-${index}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14, paddingBottom: 14, borderBottom: index < resources.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ background: resource._aiGenerated ? 'linear-gradient(135deg, #ede9ff, #ddd6fe)' : '#f8f7ff', borderRadius: 8, padding: 8, flexShrink: 0 }}>
                  {resourceIcon(resource.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1f1f1f' }}>{resource.title}</div>
                    {resource._aiGenerated && (
                      <Sparkles size={11} color="#5b47e0" />
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#9ca3af' }}>{resource.platform}</span>
                    <span style={{ fontSize: 11, background: resource.price === 'Free' || resource.price === 'Free audit' ? '#d1fae5' : '#fef3c7', color: resource.price === 'Free' || resource.price === 'Free audit' ? '#065f46' : '#92400e', padding: '1px 6px', borderRadius: 4, fontWeight: 600 }}>{resource.price}</span>
                  </div>
                </div>
                {resource.url ? (
                  <button onClick={() => openUrl(resource.url)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex' }}>
                    <ExternalLink size={14} color="#9ca3af" />
                  </button>
                ) : (
                  <ExternalLink size={14} color="#d1d5db" />
                )}
              </div>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ background: '#fef3c7', borderRadius: 8, padding: '6px', display: 'flex', alignItems: 'center' }}>
                <Zap size={14} color="#d97706" />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1f1f1f' }}>Suggested projects</div>
            </div>
            {projects.map((project, index) => (
              <div key={`${project.title}-${index}`} style={{ marginBottom: 12, padding: '12px 14px', background: '#f9f9f9', borderRadius: 12 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: '#1f1f1f', marginBottom: 6 }}>{project.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 6 }}>{project.difficulty}</span>
                  <span style={{ background: '#f8f7f4', color: '#5f5f5f', fontSize: 11, padding: '2px 7px', borderRadius: 6 }}>{project.time}</span>
                  {(project.tech || []).map((tech) => (
                    <span key={tech} style={{ background: '#f8f7ff', color: '#5b47e0', fontSize: 11, padding: '2px 7px', borderRadius: 6 }}>{tech}</span>
                  ))}
                </div>
                {project.desc ? <div style={{ fontSize: 12, color: '#5f5f5f', lineHeight: 1.5 }}>{project.desc}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
