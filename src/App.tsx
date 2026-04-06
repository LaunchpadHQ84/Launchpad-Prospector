// @ts-nocheck
import { createClient } from '@supabase/supabase-js'
import { useState, useEffect, useRef } from "react";

const supabase = createClient(
  'https://ospwmkurvkylfgbqvcco.supabase.co',
  'sb_publishable_qm0i5v5AAKB2qgFd_ZZBnA_rTvDy1YC'
)

const GOOGLE_API_KEY = '';

const searchGooglePlaces = async (query, searchLocation, searchRadius) => {
  try {
    const res = await fetch('/.netlify/functions/places', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location: searchLocation, radius: searchRadius }),
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch(e) {
    console.error('Places error:', e);
    return [];
  }
};

const INDUSTRIES = [
  {
    id: 'trades', label: 'Trades', icon: '🔧',
    clientType: 'Home & Commercial Service Company',
    targetDesc: 'Finding customers who need these services',
    sub: ['Homeowners', 'Property Managers', 'HOAs', 'Real Estate Agents', 'Commercial Buildings', 'Property Investors', 'Apartment Complexes', 'New Construction Buyers'],
    services: ['Plumber', 'Roofer', 'HVAC', 'Electrician', 'Landscaper', 'General Contractor', 'Solar', 'Painting', 'Junk Removal', 'Construction', 'Windows'],
  },
  {
    id: 'medical', label: 'Medical', icon: '🏥',
    clientType: 'Medical / Dental Practice',
    targetDesc: 'Finding new patients in the local area',
    sub: ['Local Residents', 'Families with Children', 'Seniors', 'Corporate Employees', 'Insurance Plan Members', 'Recent Movers', 'College Students', 'Veterans'],
    services: ['Dentist', 'Chiropractor', 'Med Spa', 'Physical Therapy', 'Urgent Care', 'Pediatrician'],
  },
  {
    id: 'distribution', label: 'Distribution', icon: '📦',
    clientType: 'Distribution Company',
    targetDesc: 'Finding brands and products needing distribution',
    sub: ['Product Manufacturers', 'E-Commerce Brands', 'Food & Beverage Brands', 'Consumer Goods Companies', 'Import/Export Businesses', 'Retail Chains', 'Amazon Sellers', 'Startup Product Brands', 'Audio & Video Equipment Brands', 'Consumer Electronics Brands', 'Home Theater Brands', 'Car Audio Brands', 'Smart Home Technology Brands', 'DJ & Pro Audio Equipment Brands', 'Security & Surveillance Brands', 'Gaming Peripheral Brands', 'Streaming & Media Device Brands', 'LED & Lighting Technology Brands', 'Bluetooth & Wireless Accessory Brands', 'Commercial AV Integrators', 'Independent Electronics Retailers', 'Big Box Retail Buyers', 'Online Marketplace Sellers'],
    services: ['Wholesale', 'Logistics', 'Freight', 'Warehousing', 'Food Distribution', 'Auto Parts'],
  },
  {
    id: 'sports', label: 'Sports Figures', icon: '🏆',
    clientType: 'Athlete / Sports Figure',
    targetDesc: 'Finding scouts, teams and brand sponsorships',
    sub: ['Sports Scouts', 'Team Owners', 'Brand Sponsors', 'Sports Agents', 'Athletic Apparel Brands', 'Sports Nutrition Brands', 'Media & Broadcasting', 'Sports Academies'],
    services: ['Professional Athlete', 'Personal Trainer', 'Sports Coach', 'Fitness Influencer', 'Sports Nutritionist'],
  },
  {
    id: 'influencer', label: 'Influencers', icon: '📱',
    clientType: 'Social Media Influencer / Content Creator',
    targetDesc: 'Finding brands needing a spokesperson or promoter',
    sub: ['Consumer Brands', 'Fashion & Beauty Brands', 'Tech Companies', 'Food & Beverage Brands', 'Fitness Brands', 'Marketing Agencies', 'Lifestyle Brands', 'Entertainment Companies', 'Offroad & Powersports Brands', 'Side-by-Side Dealerships', 'ATV & Dirt Bike Dealerships', 'Adventure Rental Companies', 'Outdoor Gear Brands', 'Truck & Jeep Accessories Brands', 'Motorsports Sponsors', 'Offroad Event Organizers', 'Hunting & Outdoor Lifestyle Brands', 'Energy Drink & Apparel Sponsors'],
    services: ['Instagram Influencer', 'TikTok Creator', 'YouTube Creator', 'Podcast Host', 'Brand Ambassador'],
  },
  {
    id: 'b2b', label: 'B2B / Agency', icon: '💼',
    clientType: 'Business Service Provider',
    targetDesc: 'Finding businesses needing these services',
    sub: ['Small Business Owners', 'Startup Founders', 'Restaurant Owners', 'Retail Store Owners', 'Real Estate Brokerages', 'Law Firms', 'Medical Practices', 'E-Commerce Businesses'],
    services: ['Marketing Agency', 'Web Design', 'Social Media Management', 'SEO Agency', 'Accounting Firm', 'PR Firm'],
  },
];

const SOURCES = [
  { id: 'google', label: 'Google Maps', icon: '📍', desc: 'Local business discovery' },
  { id: 'apollo', label: 'Apollo.io', icon: '🚀', desc: 'B2B contact database' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼', desc: 'Professional network' },
  { id: 'instagram', label: 'Instagram', icon: '📸', desc: 'Influencer discovery' },
  { id: 'facebook', label: 'Facebook', icon: '👥', desc: 'Business pages & groups' },
  { id: 'nextdoor', label: 'Nextdoor', icon: '🏘️', desc: 'Hyperlocal neighborhood leads' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵', desc: 'Creator & brand discovery' },
  { id: 'csv', label: 'CSV Upload', icon: '📋', desc: 'Import your own list' },
];

const SEQUENCES = [
  { name: 'Cold Intro', steps: ['Email D1', 'SMS D3', 'Email D5', 'Call D7', 'Email D10'] },
  { name: 'Re-engage', steps: ['Email D1', 'Call D2', 'SMS D4', 'Email D7'] },
  { name: 'Hot Lead Fast Track', steps: ['Call D1', 'Email D1', 'SMS D2', 'Call D4'] },
];

const STATUS_COLORS = { 'New': '#00D4FF', 'Contacted': '#F59E0B', 'Nurturing': '#8B5CF6', 'Qualified': '#10B981' };
const TONE_OPTIONS = ['Professional', 'Friendly & Casual', 'Urgent', 'Consultative', 'Bold & Direct'];
const FUNNEL_STAGES = ['Cold Intro', 'Follow-Up', 'Re-Engagement', 'Meeting Request', 'Last Touch'];

function ScoreBadge({ score }) {
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#F59E0B' : '#EF4444';
  return <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', border: `2px solid ${color}`, color, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, background: `${color}18` }}>{score}</div>;
}

function Pill({ label, color }) {
  return <span style={{ display: 'inline-block', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', background: `${color}22`, color, border: `1px solid ${color}44`, fontFamily: "'Rajdhani', sans-serif", textTransform: 'uppercase' }}>{label}</span>;
}

function StatCard({ label, value, delta, accent }) {
  return (
    <div style={{ background: 'linear-gradient(135deg, #0f1923 0%, #141f2e 100%)', border: `1px solid ${accent}33`, borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }} />
      <div style={{ fontSize: 12, color: '#6b7a8f', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', fontFamily: "'Rajdhani', sans-serif", marginTop: 4 }}>{value}</div>
      {delta && <div style={{ fontSize: 12, color: accent, marginTop: 2, fontFamily: "'Rajdhani', sans-serif" }}>{delta}</div>}
    </div>
  );
}
function EngageModal({ lead, onClose, onSent }) {
  const [channel, setChannel] = useState('email');
  const [tone, setTone] = useState('Professional');
  const [stage, setStage] = useState('Cold Intro');
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [subject, setSubject] = useState('');

  const channelConfig = {
    email: { label: 'Email', icon: '✉️', color: '#00D4FF', target: lead.email },
    sms: { label: 'SMS / Text', icon: '💬', color: '#10B981', target: lead.phone },
    call: { label: 'Phone Script', icon: '📞', color: '#F59E0B', target: lead.phone },
  };
  const cc = channelConfig[channel];

  const generateMessage = async () => {
    setLoading(true); setGenerated(null); setEditedContent(''); setSent(false);
    const prompts = {
      email: `You are an expert outbound sales copywriter. Write a personalized cold outreach EMAIL on behalf of a ${lead.type} service company reaching out to a potential customer.\n\nContext:\n- Service Provider: ${lead.type} company\n- Prospect Name: ${lead.contact}\n- Prospect Business: ${lead.name}\n- Prospect Location: ${lead.location}\n- Found via: ${lead.source}\n- Funnel Stage: ${stage}\n- Tone: ${tone}\n\nThe email is FROM the ${lead.type} company TO ${lead.name} offering their services. Be specific about value. End with CTA to book a free consultation or quote.\n\nReturn ONLY raw JSON: {"subject": "...", "body": "..."}`,
      sms: `You are an expert outbound sales copywriter. Write a personalized SMS FROM a ${lead.type} service company TO a potential customer.\n\nProspect: ${lead.contact} at ${lead.name}, ${lead.location}\nStage: ${stage}\nTone: ${tone}\n\nUnder 160 characters. Human, conversational, soft CTA.\n\nReturn ONLY the SMS text.`,
      call: `You are a sales coach. Write a phone call script for a ${lead.type} company calling a potential customer.\n\nCalling: ${lead.contact} at ${lead.name}, ${lead.location}\nStage: ${stage}\nTone: ${tone}\n\nThe caller represents the ${lead.type} company offering services TO this prospect.\n\nSections: [OPENING], [VALUE PROP], [QUALIFYING QUESTION], [CLOSE]. Under 200 words.`,
    };
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: prompts[channel] }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || '').join('') || '';
      if (channel === 'email') {
        try {
          const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
          setSubject(parsed.subject || ''); setEditedContent(parsed.body || raw); setGenerated({ subject: parsed.subject, body: parsed.body });
        } catch { setEditedContent(raw); setGenerated({ body: raw }); }
      } else { setEditedContent(raw.trim()); setGenerated({ body: raw.trim() }); }
    } catch { setEditedContent('⚠️ Could not connect to AI. Please try again.'); setGenerated({ body: '' }); }
    setLoading(false);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); onSent && onSent(lead.id, channel, editedContent, subject); }, 1400);
  };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0d1724', border: '1px solid #1a2a40', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, color: '#00D4FF', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4, fontFamily: "'Rajdhani', sans-serif" }}>✨ AI Engagement Engine</div>
            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Rajdhani', sans-serif" }}>{lead.name}</div>
            <div style={{ fontSize: 13, color: '#6b7a8f', marginTop: 2 }}>{lead.contact} · {lead.location} · {lead.type}</div>
          </div>
          <button onClick={onClose} style={{ background: '#1a2a40', border: 'none', color: '#6b7a8f', width: 34, height: 34, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {Object.entries(channelConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => { setChannel(key); setGenerated(null); setSent(false); }}
              style={{ flex: 1, padding: '13px 8px', borderRadius: 10, cursor: 'pointer', border: channel === key ? `1.5px solid ${cfg.color}` : '1px solid #1a2a40', background: channel === key ? `${cfg.color}18` : '#0a1422', fontFamily: "'Rajdhani', sans-serif" }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{cfg.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: channel === key ? cfg.color : '#6b7a8f' }}>{cfg.label}</div>
              <div style={{ fontSize: 10, color: '#3a5070', marginTop: 2 }}>{cfg.target}</div>
            </button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {[['Tone', tone, setTone, TONE_OPTIONS], ['Funnel Stage', stage, setStage, FUNNEL_STAGES]].map(([lbl, val, setter, opts]) => (
            <div key={lbl}>
              <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>{lbl}</div>
              <select value={val} onChange={e => setter(e.target.value)} style={{ width: '100%', background: '#0a1422', border: '1px solid #1e3048', borderRadius: 8, padding: '9px 12px', color: '#e2e8f0', fontSize: 13, outline: 'none', fontFamily: "'Rajdhani', sans-serif" }}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button onClick={generateMessage} disabled={loading}
          style={{ width: '100%', padding: 14, borderRadius: 10, border: 'none', background: loading ? '#1a2a40' : `linear-gradient(90deg, ${cc.color}, ${cc.color}99)`, color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? <><span style={{ width: 16, height: 16, border: '2px solid #ffffff44', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /> Generating...</> : `✨ Generate AI ${cc.label}`}
        </button>
        {generated && !loading && (
          <div>
            {channel === 'email' && subject && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Rajdhani', sans-serif" }}>Subject Line</div>
                <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', background: '#0a1422', border: '1px solid #00D4FF44', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: "'Rajdhani', sans-serif", boxSizing: 'border-box' }} />
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: '#4a5568', fontWeight: 700, textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>{channel === 'call' ? 'Call Script' : 'Message'}</div>
                <div style={{ fontSize: 11, color: '#3a5070' }}>✏️ Click to edit</div>
              </div>
              <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)} rows={channel === 'call' ? 11 : channel === 'sms' ? 4 : 8}
                style={{ width: '100%', background: '#050d16', border: `1px solid ${cc.color}33`, borderRadius: 10, padding: '14px 16px', color: '#c8d8e8', fontSize: 13, outline: 'none', fontFamily: channel === 'call' ? 'monospace' : "'Rajdhani', sans-serif", lineHeight: 1.75, resize: 'vertical', boxSizing: 'border-box' }} />
              {channel === 'sms' && <div style={{ fontSize: 11, color: editedContent.length > 160 ? '#EF4444' : '#4a5568', textAlign: 'right', marginTop: 4 }}>{editedContent.length}/160</div>}
            </div>
            {!sent ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={generateMessage} style={{ flex: 1, padding: 11, borderRadius: 8, border: '1px solid #1a2a40', background: '#0a1422', color: '#6b7a8f', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, textTransform: 'uppercase', cursor: 'pointer' }}>🔄 Regenerate</button>
                <button onClick={handleSend} disabled={sending}
                  style={{ flex: 2, padding: 11, borderRadius: 8, border: 'none', background: sending ? '#1a2a40' : `linear-gradient(90deg, ${cc.color}, ${cc.color}bb)`, color: '#fff', fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 14, textTransform: 'uppercase', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {sending ? 'Sending...' : `${cc.icon} Send ${cc.label}`}
                </button>
              </div>
            ) : (
              <div style={{ background: '#10B98118', border: '1px solid #10B98144', borderRadius: 12, padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#10B981', fontFamily: "'Rajdhani', sans-serif" }}>
                  {channel === 'email' ? `Email sent to ${cc.target}` : channel === 'sms' ? `Text sent to ${cc.target}` : `Call script ready for ${cc.target}`}
                </div>
                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 4 }}>Lead marked Contacted · Saved to Supabase · Logged to Ignite CRM</div>
                <button onClick={() => { setSent(false); setGenerated(null); }} style={{ marginTop: 14, padding: '8px 20px', borderRadius: 8, border: '1px solid #1a2a40', background: '#0a1422', color: '#6b7a8f', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Send Another</button>
              </div>
            )}
          </div>
        )}
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );
}
export default function LaunchpadProspector() {
  const [activeTab, setActiveTab] = useState('discover');
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [selectedSubs, setSelectedSubs] = useState([]);
  const [selectedSources, setSelectedSources] = useState(['google']);
  const [location, setLocation] = useState('');
  const [radius, setRadius] = useState('25');
  const [leads, setLeads] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchLog, setSearchLog] = useState([]);
  const [activeSequence, setActiveSequence] = useState(0);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterIndustry, setFilterIndustry] = useState('All');
  const [csvDrag, setCsvDrag] = useState(false);
  const [engageLead, setEngageLead] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [dbConnected, setDbConnected] = useState(false);
  const logRef = useRef(null);

  const tabs = [
    { id: 'discover', label: 'Lead Discovery', icon: '🔍' },
    { id: 'leads', label: 'Pipeline', icon: '📊' },
    { id: 'engage', label: 'AI Engage', icon: '🤖', badge: true },
    { id: 'sequences', label: 'Sequences', icon: '📡' },
    { id: 'import', label: 'Import', icon: '📥' },
    { id: 'crm', label: 'CRM Sync', icon: '🔗' },
  ];

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data && data.length > 0) { setLeads(data); setDbConnected(true); }
  };

  const fetchActivity = async () => {
    const { data } = await supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) setActivityLog(data.map(a => ({ ...a, lead: a.lead_name, msg: a.message, time: new Date(a.created_at).toLocaleTimeString(), color: a.channel === 'email' ? '#00D4FF' : a.channel === 'sms' ? '#10B981' : '#F59E0B' })));
  };

  useEffect(() => { fetchLeads(); fetchActivity(); }, []);

  const toggleSource = id => setSelectedSources(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);
  const toggleLead = id => setSelectedLeads(p => p.includes(id) ? p.filter(l => l !== id) : [...p, id]);
  const toggleSub = s => setSelectedSubs(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const runDiscovery = async () => {
    if (!selectedIndustry) return;
    if (!location) { alert('Please enter a city, state or zip code first!'); return; }
    setSearching(true); setSearchProgress(0); setSearchLog([]);
    const searchQuery = selectedSubs.length > 0 ? selectedSubs[0] : selectedIndustry.label;
    const allQueries = selectedSubs.length > 0 ? selectedSubs : [selectedIndustry.label];
    const logMessages = [
      '🔍 Searching Google Maps for: ' + allQueries.join(' + ') + ' near ' + location + '...',
      '📍 Radius: ' + radius + ' miles — pulling real local businesses...',
      '⚡ Applying AI lead scoring...',
      '📊 Enriching contact data — phone, address, website...',
      '💾 Saving leads to your database...',
    ];
    let i = 0;
    const logInterval = setInterval(() => {
      setSearchProgress(p => Math.min(p + 15, 80));
      if (i < logMessages.length) { setSearchLog(p => [...p, logMessages[i]]); i++; }
    }, 800);
    try {
      let allLeads = [];
      for (const query of allQueries) {
        const newLeads = await searchGooglePlaces(query, location, radius);
        allLeads = [...allLeads, ...newLeads];
      }
      clearInterval(logInterval);
      if (allLeads.length === 0) {
        setSearchLog(p => [...p, '⚠️ No results found. Try a broader search term or different location.']);
        setSearching(false);
        return;
      }
      for (const lead of allLeads) {
        await supabase.from('leads').insert(lead);
      }
      setSearchProgress(100);
      setSearchLog(p => [...p, '✅ ' + allLeads.length + ' real leads found and saved to your pipeline!']);
      setTimeout(() => { setSearching(false); fetchLeads(); setActiveTab('leads'); }, 1500);
    } catch(err) {
      clearInterval(logInterval);
      setSearchLog(p => [...p, '⚠️ Error connecting to Google Maps. Please try again.']);
      setSearching(false);
    }
  };

  const handleEngageSent = async (leadId, channel, message, subject) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    await supabase.from('leads').update({ status: 'Contacted' }).eq('id', leadId);
    await supabase.from('activity_log').insert({
      lead_id: leadId, lead_name: lead.name, channel,
      message: channel === 'email' ? (subject || 'Email sent') : channel === 'sms' ? 'Text sent' : 'Call script used',
      subject: subject || '', created_at: new Date().toISOString()
    });
    fetchLeads(); fetchActivity();
  };

  const filteredLeads = leads.filter(l =>
    (filterStatus === 'All' || l.status === filterStatus) &&
    (filterIndustry === 'All' || l.type === filterIndustry)
  );

  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [searchLog]);

  const S = {
    root: { fontFamily: "'Rajdhani','Segoe UI',sans-serif", background: '#080f1a', minHeight: '100vh', color: '#e2e8f0' },
    header: { background: 'linear-gradient(90deg,#080f1a,#0d1a2e 50%,#080f1a)', borderBottom: '1px solid #1a2a40', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 },
    nav: { display: 'flex', gap: 2, padding: '0 32px', borderBottom: '1px solid #1a2a40', background: '#0a1422' },
    navItem: a => ({ padding: '14px 18px', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: a ? '#00D4FF' : '#6b7a8f', background: 'none', border: 'none', borderBottom: a ? '2px solid #00D4FF' : '2px solid transparent', fontFamily: "'Rajdhani',sans-serif", transition: 'all 0.2s' }),
    content: { padding: 28, maxWidth: 1200, margin: '0 auto' },
    card: { background: 'linear-gradient(135deg,#0f1923,#111d2e)', border: '1px solid #1a2a40', borderRadius: 16, padding: 28, marginBottom: 24 },
    sT: { fontSize: 18, fontWeight: 800, letterSpacing: '0.05em', color: '#e2e8f0', marginBottom: 4, textTransform: 'uppercase' },
    sS: { fontSize: 13, color: '#6b7a8f', marginBottom: 20 },
    input: { background: '#0a1422', border: '1px solid #1e3048', borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none', fontFamily: "'Rajdhani',sans-serif", width: '100%', boxSizing: 'border-box' },
    lbl: { fontSize: 12, color: '#6b7a8f', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, display: 'block' },
    btn: (v = 'primary', c = '#00D4FF') => ({ padding: '11px 22px', borderRadius: 8, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', border: v === 'ghost' ? '1px solid #1a2a40' : 'none', background: v === 'primary' ? `linear-gradient(90deg,${c},${c}bb)` : v === 'ghost' ? 'transparent' : '#1a2a40', color: v === 'ghost' ? '#6b7a8f' : '#fff', transition: 'all 0.2s' }),
    th: { textAlign: 'left', padding: '10px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a5568', borderBottom: '1px solid #1a2a40' },
    td: { padding: '12px 14px', fontSize: 14, borderBottom: '1px solid #111d2e', verticalAlign: 'middle' },
  };

  return (
    <div style={S.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700;800&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#080f1a}::-webkit-scrollbar-thumb{background:#1a2a40;border-radius:3px}
        input::placeholder,textarea::placeholder{color:#3a4a5a}
        tbody tr:hover td{background:#0d1a2e55}
        select option{background:#0d1724}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

      {engageLead && <EngageModal lead={engageLead} onClose={() => setEngageLead(null)} onSent={handleEngageSent} />}

      <div style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg,#00D4FF,#0044BB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🚀</div>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '0.05em', background: 'linear-gradient(90deg,#00D4FF,#0088FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LAUNCHPAD</span>
          <span style={{ fontSize: 12, color: '#2a3a50' }}>|</span>
          <span style={{ fontSize: 13, color: '#3a5070', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Prospector</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: dbConnected ? '#10B98118' : '#F59E0B18', border: `1px solid ${dbConnected ? '#10B98144' : '#F59E0B44'}`, borderRadius: 20, padding: '4px 14px', fontSize: 11, color: dbConnected ? '#10B981' : '#F59E0B', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: dbConnected ? '#10B981' : '#F59E0B', animation: 'pulse 2s infinite' }} />
            {dbConnected ? 'DB CONNECTED' : 'CONNECTING...'}
          </div>
          <div style={{ background: '#10B98118', border: '1px solid #10B98144', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s infinite' }} /> AI ENGINE ACTIVE
          </div>
          <div style={{ background: '#00D4FF18', border: '1px solid #00D4FF44', borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#00D4FF', fontWeight: 700 }}>✦ IGNITE CRM CONNECTED</div>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#0066DD,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800 }}>LP</div>
        </div>
      </div>

      <div style={S.nav}>
        {tabs.map(t => (
          <button key={t.id} style={S.navItem(activeTab === t.id)} onClick={() => setActiveTab(t.id)}>
            {t.icon} {t.label}
            {t.badge && <span style={{ marginLeft: 6, background: '#00D4FF', color: '#080f1a', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 800 }}>AI</span>}
          </button>
        ))}
      </div>

      <div style={S.content}>
        {!['sequences','import'].includes(activeTab) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Leads" value={leads.length} delta={dbConnected ? 'Live from Supabase ✓' : 'Loading...'} accent="#00D4FF" />
            <StatCard label="Outreach Sent" value={activityLog.length} delta="All channels" accent="#10B981" />
            <StatCard label="Qualified" value={leads.filter(l => l.status === 'Qualified').length} delta="Ready to close" accent="#8B5CF6" />
            <StatCard label="Contacted" value={leads.filter(l => l.status === 'Contacted').length} delta="In conversation" accent="#F59E0B" />
          </div>
        )}

        {activeTab === 'discover' && (<>
          <div style={S.card}>
            <div style={S.sT}>What service does your client provide?</div>
            <div style={S.sS}>We will find their ideal customers in your target area</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10, marginBottom: 20 }}>
              {INDUSTRIES.map(ind => (
                <div key={ind.id} onClick={() => { setSelectedIndustry(ind); setSelectedSubs([]); }}
                  style={{ padding: '14px 10px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: selectedIndustry?.id === ind.id ? '1px solid #00D4FF' : '1px solid #1a2a40', background: selectedIndustry?.id === ind.id ? '#00D4FF11' : '#0a1422', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ind.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: selectedIndustry?.id === ind.id ? '#00D4FF' : '#8898aa' }}>{ind.label}</div>
                </div>
              ))}
            </div>
            {selectedIndustry && (
              <div>
                <label style={S.lbl}>
                  Target Customer Type
                  {selectedSubs.length > 0 && <span style={{ marginLeft: 8, background: '#00D4FF', color: '#080f1a', borderRadius: 10, padding: '1px 8px', fontSize: 10, fontWeight: 800 }}>{selectedSubs.length} selected</span>}
                </label>
                <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 10 }}>Click to select multiple — we will search for all of them</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {selectedIndustry.sub.map(s => (
                    <div key={s} onClick={() => toggleSub(s)}
                      style={{ padding: '6px 16px', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600, border: selectedSubs.includes(s) ? '2px solid #00D4FF' : '1px solid #1a2a40', background: selectedSubs.includes(s) ? '#00D4FF22' : '#0a1422', color: selectedSubs.includes(s) ? '#00D4FF' : '#6b7a8f', transition: 'all 0.2s', userSelect: 'none' }}>
                      {selectedSubs.includes(s) ? '✓ ' : ''}{s}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div style={S.card}>
              <div style={S.sT}>Data Sources</div>
              <div style={S.sS}>Select where to discover leads from</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {SOURCES.map(src => (
                  <div key={src.id} onClick={() => toggleSource(src.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, cursor: 'pointer', border: selectedSources.includes(src.id) ? '1px solid #00D4FF55' : '1px solid #1a2a40', background: selectedSources.includes(src.id) ? '#00D4FF09' : '#0a1422', transition: 'all 0.2s' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selectedSources.includes(src.id) ? '#00D4FF' : '#2a3a50'}`, background: selectedSources.includes(src.id) ? '#00D4FF' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, color: '#000', fontWeight: 800 }}>
                      {selectedSources.includes(src.id) && '✓'}
                    </div>
                    <span style={{ fontSize: 16 }}>{src.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{src.label}</div>
                      <div style={{ fontSize: 11, color: '#4a5568' }}>{src.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.card}>
              <div style={S.sT}>Location & Radius</div>
              <div style={S.sS}>Define your geographic targeting</div>
              <label style={S.lbl}>City, State or Zip Code</label>
              <input style={{ ...S.input, marginBottom: 16 }} placeholder="e.g. Charlotte, NC or 28138" value={location} onChange={e => setLocation(e.target.value)} />
              <label style={S.lbl}>Search Radius: {radius} miles</label>
              <input type="range" min="5" max="100" step="5" value={radius} onChange={e => setRadius(e.target.value)} style={{ width: '100%', accentColor: '#00D4FF', marginBottom: 6 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#3a4a5a', marginBottom: 20 }}><span>5 mi</span><span>50 mi</span><span>100 mi</span></div>
              <label style={S.lbl}>Max Leads Per Search</label>
              <input style={S.input} placeholder="20" defaultValue="20" />
            </div>
          </div>

          {searching && (
            <div style={{ ...S.card, borderColor: '#00D4FF33', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#00D4FF' }}>🔍 Live Discovery in Progress...</div>
                <div style={{ fontSize: 13, color: '#00D4FF', fontWeight: 700 }}>{searchProgress}%</div>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: '#1a2a40', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${searchProgress}%`, transition: 'width 0.5s ease', background: 'linear-gradient(90deg,#00D4FF,#0066DD)' }} />
              </div>
              <div ref={logRef} style={{ marginTop: 14, background: '#050d16', borderRadius: 8, padding: 14, maxHeight: 160, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, color: '#4ade80' }}>
                {searchLog.map((l, i) => <div key={i} style={{ marginBottom: 4 }}>{l}</div>)}
              </div>
            </div>
          )}
          <button style={{ ...S.btn('primary'), width: '100%', padding: 14, fontSize: 16, opacity: selectedIndustry ? 1 : 0.4 }} onClick={runDiscovery} disabled={!selectedIndustry || searching}>
            {searching ? '⏳ Discovering Real Leads...' : '🚀 Launch Discovery'}
          </button>
        </>)}
        {activeTab === 'leads' && (
          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={S.sT}>Lead Pipeline — {filteredLeads.length} leads {dbConnected && <span style={{ fontSize: 12, color: '#10B981' }}>● Live</span>}</div>
                <div style={S.sS}>Click ✉️ 💬 📞 on any lead to open the AI Engagement Engine</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={S.btn('ghost')} onClick={() => alert(`✅ ${selectedLeads.length || leads.length} leads pushed to Ignite CRM!`)}>🔗 Push to CRM</button>
                <button style={S.btn('primary')} onClick={() => setActiveTab('engage')}>🤖 AI Engage</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {['All','New','Contacted','Nurturing','Qualified'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: filterStatus === s ? '1px solid #00D4FF44' : '1px solid #1a2a40', background: filterStatus === s ? '#00D4FF22' : '#0a1422', color: filterStatus === s ? '#00D4FF' : '#6b7a8f', fontFamily: "'Rajdhani',sans-serif" }}>{s}</button>
              ))}
              <div style={{ width: 1, background: '#1a2a40', margin: '0 4px' }} />
              {['All','Trades','Medical','Distribution','Sports','Influencers','B2B'].map(s => (
                <button key={s} onClick={() => setFilterIndustry(s)} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: filterIndustry === s ? '1px solid #8B5CF644' : '1px solid #1a2a40', background: filterIndustry === s ? '#8B5CF622' : '#0a1422', color: filterIndustry === s ? '#8B5CF6' : '#6b7a8f', fontFamily: "'Rajdhani',sans-serif" }}>{s}</button>
              ))}
            </div>
            {leads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4a5568', fontSize: 14 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
                Loading leads from Supabase...
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['','Score','Business / Contact','Industry','Location','Source','Status','Engage'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td style={S.td}><input type="checkbox" checked={selectedLeads.includes(lead.id)} onChange={() => toggleLead(lead.id)} style={{ accentColor: '#00D4FF' }} /></td>
                      <td style={S.td}><ScoreBadge score={lead.score} /></td>
                      <td style={S.td}><div style={{ fontWeight: 700 }}>{lead.name}</div><div style={{ fontSize: 12, color: '#6b7a8f' }}>{lead.contact} · {lead.phone}</div><div style={{ fontSize: 11, color: '#3a5070' }}>{lead.email}</div></td>
                      <td style={S.td}><Pill label={lead.type} color="#8B5CF6" /></td>
                      <td style={{ ...S.td, color: '#6b7a8f', fontSize: 13 }}>{lead.location}</td>
                      <td style={S.td}><Pill label={lead.source} color="#00D4FF" /></td>
                      <td style={S.td}><Pill label={lead.status} color={STATUS_COLORS[lead.status] || '#6b7a8f'} /></td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 5 }}>
                          {[['✉️','#00D4FF'],['💬','#10B981'],['📞','#F59E0B']].map(([icon, col]) => (
                            <button key={icon} onClick={() => setEngageLead(lead)} style={{ background: `${col}11`, border: `1px solid ${col}33`, borderRadius: 6, padding: '5px 8px', cursor: 'pointer', fontSize: 14 }}>{icon}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'engage' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
            <div style={S.card}>
              <div style={S.sT}>🤖 AI Engagement Engine</div>
              <div style={S.sS}>Select any lead to compose AI-personalized email, SMS, or call script</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {leads.map(lead => (
                  <div key={lead.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#0a1422', borderRadius: 10, border: '1px solid #1a2a40', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#00D4FF44'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2a40'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <ScoreBadge score={lead.score} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{lead.name}</div>
                        <div style={{ fontSize: 12, color: '#6b7a8f' }}>{lead.contact} · {lead.type} · {lead.location}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Pill label={lead.status} color={STATUS_COLORS[lead.status] || '#6b7a8f'} />
                      <button onClick={() => setEngageLead(lead)} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: 'linear-gradient(90deg,#00D4FF,#0066DD)', color: '#fff', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>✨ Engage</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Activity Log</div>
                <div style={{ fontSize: 12, color: '#6b7a8f', marginBottom: 16 }}>Live from Supabase</div>
                {activityLog.length === 0 ? (
                  <div style={{ fontSize: 13, color: '#4a5568', textAlign: 'center', padding: '20px 0' }}>No activity yet — send your first message!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {activityLog.slice(0, 8).map(entry => (
                      <div key={entry.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '10px 12px', background: '#0a1422', borderRadius: 8, border: '1px solid #1a2a40' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${entry.color}22`, border: `1px solid ${entry.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                          {entry.channel === 'email' ? '✉️' : entry.channel === 'sms' ? '💬' : '📞'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.lead}</div>
                          <div style={{ fontSize: 11, color: '#6b7a8f' }}>{entry.msg}</div>
                        </div>
                        <div style={{ fontSize: 10, color: '#3a5070', whiteSpace: 'nowrap' }}>{entry.time}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={S.card}>
                <div style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Channel Stats</div>
                {[['✉️ Email', activityLog.filter(a=>a.channel==='email').length, '#00D4FF'],
                  ['💬 SMS', activityLog.filter(a=>a.channel==='sms').length, '#10B981'],
                  ['📞 Calls', activityLog.filter(a=>a.channel==='call').length, '#F59E0B']].map(([label,count,color]) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                      <span style={{ color: '#8898aa', fontWeight: 600 }}>{label}</span>
                      <span style={{ color, fontWeight: 700 }}>{count} sent</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#1a2a40' }}>
                      <div style={{ height: '100%', borderRadius: 3, width: `${Math.min((count/10)*100,100)}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sequences' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
            <div style={S.card}>
              <div style={S.sT}>Sequences</div>
              <div style={S.sS}>Select a nurture flow</div>
              {SEQUENCES.map((seq,i) => (
                <div key={i} onClick={() => setActiveSequence(i)} style={{ padding: '12px 14px', borderRadius: 8, cursor: 'pointer', marginBottom: 8, border: activeSequence===i ? '1px solid #00D4FF55' : '1px solid #1a2a40', background: activeSequence===i ? '#00D4FF0a' : '#0a1422', transition: 'all 0.2s' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: activeSequence===i ? '#00D4FF' : '#e2e8f0' }}>{seq.name}</div>
                  <div style={{ fontSize: 11, color: '#4a5568', marginTop: 2 }}>{seq.steps.length} steps</div>
                </div>
              ))}
              <button style={{ ...S.btn('ghost'), width: '100%', marginTop: 8 }}>+ New Sequence</button>
            </div>
            <div style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div><div style={S.sT}>{SEQUENCES[activeSequence].name}</div><div style={S.sS}>Multi-channel outreach automation</div></div>
                <button style={S.btn('primary')}>▶ Activate Sequence</button>
              </div>
              {SEQUENCES[activeSequence].steps.map((step,i) => {
                const isE=step.includes('Email'),isS=step.includes('SMS');
                const col=isE?'#00D4FF':isS?'#10B981':'#F59E0B';
                const ico=isE?'✉️':isS?'💬':'📞';
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${col}22`, border: `1px solid ${col}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{ico}</div>
                      {i<SEQUENCES[activeSequence].steps.length-1 && <div style={{ width:1,height:24,background:'#1a2a40',marginTop:4 }} />}
                    </div>
                    <div style={{ flex:1,background:'#0a1422',border:'1px solid #1a2a40',borderRadius:10,padding:'12px 16px' }}>
                      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                        <div><Pill label={isE?'Email':isS?'SMS':'Phone Call'} color={col} /><span style={{ marginLeft:10,fontSize:13,fontWeight:700,color:col }}>{step}</span></div>
                        <div style={{ fontSize:12,color:'#3a5070' }}>AI-personalized · Auto-send</div>
                      </div>
                      <div style={{ marginTop:8,fontSize:12,color:'#4a5568',fontStyle:'italic' }}>
                        {isE ? '"Hi [First Name], I noticed [Business] could benefit from..."' : isS ? '"Hey [First Name], following up from Launchpad..."' : 'AI voice: Intro call, qualify interest, book meeting'}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div style={{ borderTop:'1px solid #1a2a40',paddingTop:20 }}>
                <label style={S.lbl}>Assign to leads</label>
                <div style={{ display:'flex',gap:10 }}>
                  <input style={{ ...S.input,flex:1 }} placeholder="Search leads or select a tag..." />
                  <button style={S.btn('primary')}>Assign</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'import' && (
          <div style={S.card}>
            <div style={S.sT}>Import Contacts</div>
            <div style={S.sS}>Upload a CSV of existing leads to merge into your pipeline</div>
            <div onDragOver={e=>{e.preventDefault();setCsvDrag(true)}} onDragLeave={()=>setCsvDrag(false)}
              onDrop={e=>{e.preventDefault();setCsvDrag(false);alert('CSV imported! Contacts added to pipeline.')}}
              style={{ border:`2px dashed ${csvDrag?'#00D4FF':'#1a2a40'}`,borderRadius:12,padding:'60px 40px',textAlign:'center',background:csvDrag?'#00D4FF08':'#0a1422',transition:'all 0.2s',marginBottom:24,cursor:'pointer' }}>
              <div style={{ fontSize:48,marginBottom:12 }}>📋</div>
              <div style={{ fontSize:16,fontWeight:700,marginBottom:6 }}>Drag & Drop CSV File</div>
              <div style={{ fontSize:13,color:'#6b7a8f',marginBottom:16 }}>or click to browse files</div>
              <button style={S.btn('ghost')}>Browse Files</button>
            </div>
            <div style={{ background:'#0a1422',borderRadius:8,padding:16 }}>
              <div style={{ fontSize:12,fontWeight:700,color:'#6b7a8f',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:10 }}>Expected CSV Columns</div>
              <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
                {['Business Name','Contact Name','Email','Phone','Industry','City','State','Website'].map(col=>(
                  <span key={col} style={{ background:'#1a2a40',borderRadius:4,padding:'3px 10px',fontSize:12,color:'#8898aa' }}>{col}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (<>
          <div style={S.card}>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
              <div><div style={S.sT}>Ignite CRM — GHL Integration</div><div style={S.sS}>Real-time sync with Go High Level</div></div>
              <div style={{ display:'flex',alignItems:'center',gap:8,background:'#10B98122',border:'1px solid #10B98144',borderRadius:20,padding:'6px 16px' }}>
                <div style={{ width:8,height:8,borderRadius:'50%',background:'#10B981',animation:'pulse 2s infinite' }} />
                <span style={{ fontSize:13,color:'#10B981',fontWeight:700 }}>Connected</span>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginTop:24 }}>
              {[['GHL Workspace','Launchpad / Ignite CRM'],['Pipeline','Outbound Prospector'],['Database','Supabase — Live'],['Last Synced','Just now']].map(([lbl,val])=>(
                <div key={lbl} style={{ background:'#0a1422',borderRadius:8,padding:'14px 16px' }}>
                  <div style={{ fontSize:11,color:'#4a5568',fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:4 }}>{lbl}</div>
                  <div style={{ fontSize:14,fontWeight:700 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={S.card}>
            <div style={S.sT}>Sync Settings</div>
            <div style={S.sS}>Control what gets pushed to your CRM</div>
            <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
              {[['Auto-push new leads on discovery',true],['Sync outreach activity (emails, calls, SMS)',true],['Update lead status from CRM',true],['Push AI lead score as custom field',false],['Create tasks for hot leads (score 90+)',true]].map(([lbl,on])=>(
                <div key={lbl} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'#0a1422',borderRadius:8,border:'1px solid #1a2a40' }}>
                  <span style={{ fontSize:14 }}>{lbl}</span>
                  <div style={{ width:44,height:24,borderRadius:12,background:on?'#00D4FF':'#1a2a40',position:'relative',cursor:'pointer' }}>
                    <div style={{ width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:on?23:3,transition:'left 0.2s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>)}

      </div>
    </div>
  );
}   