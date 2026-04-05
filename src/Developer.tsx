import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Shield, Globe, Key, Settings, 
  Save, ArrowLeft, ExternalLink, Cpu, 
  Database, Activity, Lock, AlertTriangle, MapPin, 
  List, Trash2, RefreshCw, Play, User as UserIcon, Building, Info
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { DeveloperConfig, User } from './types';
import { getCurrentUser, getDeveloperConfig, saveDeveloperConfig, saveOrders, getUsers, saveUsers } from './lib/storage';
import { Button, Badge, SectionHeading, Toast, ToastType } from './components/UI';
import { cn } from './lib/utils';

export const Developer = () => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<DeveloperConfig | null>(null);
  const [logs, setLogs] = useState<{ id: string, timestamp: string, level: 'info' | 'warn' | 'error', message: string }[]>([]);
  const [isLogging, setIsLogging] = useState(true);
  const [command, setCommand] = useState('');
  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'dev') {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    setConfig(getDeveloperConfig());
    
    // Initial logs
    const initialLogs = [
      { id: '1', timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Sistema de logs inicializado.' },
      { id: '2', timestamp: new Date().toLocaleTimeString(), level: 'info', message: 'Conexão com LocalStorage estabelecida.' },
      { id: '3', timestamp: new Date().toLocaleTimeString(), level: 'warn', message: 'HMR desativado pelo ambiente de produção.' }
    ] as const;
    setLogs(Array.from(initialLogs));
  }, [navigate]);

  useEffect(() => {
    if (!isLogging) return;

    const logInterval = setInterval(() => {
      const events = [
        { level: 'info', message: 'Requisição GET /api/products processada (200 OK)' },
        { level: 'info', message: 'Sessão do usuário validada via JWT' },
        { level: 'info', message: 'Cache de imagens Unsplash atualizado' },
        { level: 'warn', message: 'Latência detectada no Gateway de Pagamento (450ms)' },
        { level: 'info', message: 'Sincronização de estoque concluída' },
        { level: 'info', message: 'Novo log de analytics enviado para G-CHRONOS' },
        { level: 'error', message: 'Falha na tentativa de acesso não autorizado em /admin/config' },
        { level: 'info', message: 'Consulta ViaCEP realizada com sucesso' }
      ] as const;

      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const newLog = {
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toLocaleTimeString(),
        ...randomEvent
      };

      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 3000);

    return () => clearInterval(logInterval);
  }, [isLogging]);

  const handleSave = () => {
    if (config) {
      saveDeveloperConfig(config);
      setToast({ message: 'Configurações de desenvolvedor salvas!', type: 'success', isVisible: true });
    }
  };

  const addLog = (message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const newLog = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmd = command.trim().toLowerCase();
    setCommand('');
    addLog(`> ${cmd}`, 'info');

    if (cmd === '/help') {
      addLog('Comandos disponíveis:', 'info');
      addLog('/restart - Recarrega a página.', 'info');
      addLog('/restart -all - Limpa erros e reinicia o sistema.', 'info');
      addLog('/reset pedidos - Apaga todos os pedidos do sistema.', 'info');
      addLog('/list users - Lista todos os usuários cadastrados.', 'info');
      addLog('/delete user <email> - Deleta um usuário pelo email.', 'info');
      addLog('/clear - Limpa o console de logs.', 'info');
      addLog('/config -reset - Reseta as configurações de dev.', 'info');
      addLog('/storage -clear - Limpa TODO o LocalStorage (CUIDADO).', 'info');
      addLog('/status - Mostra o estado atual do sistema.', 'info');
    } else if (cmd === '/restart') {
      addLog('Reiniciando sistema...', 'warn');
      setTimeout(() => window.location.reload(), 1000);
    } else if (cmd === '/restart -all') {
      addLog('Limpando erros e reiniciando sistema...', 'error');
      localStorage.removeItem('chronos_logs'); // Se houvesse log persistente
      sessionStorage.clear();
      setTimeout(() => window.location.reload(), 1500);
    } else if (cmd === '/reset pedidos') {
      addLog('APAGANDO TODOS OS PEDIDOS DO SISTEMA...', 'error');
      saveOrders([]);
      addLog('Todos os pedidos foram removidos com sucesso.', 'success' as any);
    } else if (cmd === '/list users') {
      const users = getUsers();
      addLog(`Total de usuários: ${users.length}`, 'info');
      users.forEach(u => {
        addLog(`${u.name} (${u.email}) - Role: ${u.role}`, 'info');
      });
    } else if (cmd.startsWith('/delete user ')) {
      const emailToDelete = cmd.replace('/delete user ', '').trim();
      if (!emailToDelete) {
        addLog('Erro: E-mail não fornecido.', 'error');
      } else {
        const users = getUsers();
        const userExists = users.some(u => u.email === emailToDelete);
        if (!userExists) {
          addLog(`Erro: Usuário com e-mail ${emailToDelete} não encontrado.`, 'error');
        } else {
          const newUsers = users.filter(u => u.email !== emailToDelete);
          saveUsers(newUsers);
          addLog(`Usuário ${emailToDelete} removido com sucesso.`, 'warn');
        }
      }
    } else if (cmd === '/clear') {
      setLogs([]);
    } else if (cmd === '/config -reset') {
      localStorage.removeItem('chronos_developer_config');
      addLog('Configurações resetadas para o padrão.', 'warn');
      setTimeout(() => window.location.reload(), 1000);
    } else if (cmd === '/storage -clear') {
      addLog('LIMPANDO TODO O ARMAZENAMENTO LOCAL...', 'error');
      localStorage.clear();
      setTimeout(() => window.location.reload(), 2000);
    } else if (cmd === '/status') {
      addLog(`Ambiente: ${process.env.NODE_ENV}`, 'info');
      addLog(`Plataforma: AI Studio Build`, 'info');
      addLog(`Versão: Chronos v2.4.0-stable`, 'info');
      addLog(`Status DB: Online`, 'info');
    } else {
      addLog(`Comando não reconhecido: ${cmd}. Digite /help para ajuda.`, 'error');
    }
  };

  if (!user || !config) return null;

  const externalConnections = [
    {
      name: 'Unsplash API',
      url: config.unsplashApiUrl,
      purpose: 'Fornecimento de imagens de alta resolução para produtos e banners.',
      type: 'CDN / Assets',
      status: 'Ativo'
    },
    {
      name: 'Google Fonts',
      url: config.googleFontsUrl,
      purpose: 'Carregamento de tipografia personalizada (Inter, Playfair Display).',
      type: 'Web Fonts',
      status: 'Ativo'
    },
    {
      name: 'Chronos Analytics',
      url: 'https://analytics.chronos.com',
      purpose: 'Monitoramento de tráfego e conversões em tempo real.',
      type: 'Analytics',
      status: 'Em Espera'
    },
    {
      name: 'Gateway de Pagamento',
      url: config.mockExternalApi,
      purpose: 'Processamento seguro de transações via Cartão, Boleto e Pix.',
      type: 'Fintech / API',
      status: 'Sandbox'
    },
    {
      name: 'ViaCEP API',
      url: config.viacepApiUrl,
      purpose: 'Consulta de endereços e validação de CEP em tempo real.',
      type: 'Utility / API',
      status: 'Ativo'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 font-mono selection:bg-gold selection:text-black">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={() => setToast({ ...toast, isVisible: false })} 
      />

      {/* Dev Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center text-gold border border-gold/20">
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-widest uppercase">Dev Console</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Chronos v{config.appVersion}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-[10px] font-bold uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-2">
              <ArrowLeft size={14} /> Sair do Console
            </Link>
            <Button onClick={handleSave} variant="gold" size="sm" icon={Save}>
              Compilar & Salvar
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-32">
        <div className="max-w-7xl mx-auto px-6 space-y-24">
          
          {/* Hero */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gold/10 border border-gold/20 rounded-full text-gold text-[10px] font-bold uppercase tracking-widest">
              <Shield size={12} /> Acesso de Nível 4: Desenvolvedor
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">
              Ambiente de <span className="text-gold italic">Configuração</span>
            </h2>
            <p className="max-w-2xl text-gray-500 text-sm leading-relaxed">
              Este painel permite a gestão centralizada de chaves de API, endpoints externos e variáveis de ambiente. 
              Alterações aqui impactam globalmente o comportamento do sistema Chronos.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* API Keys Section */}
            <div className="lg:col-span-7 space-y-12">
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <Key className="text-gold" size={24} />
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest">Chaves & APIs</h3>
                </div>

                <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                      <Cpu size={12} /> Gemini AI API Key
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={config.geminiApiKey} 
                        onChange={e => setConfig({...config, geminiApiKey: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-gold font-mono text-xs"
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700" size={14} />
                    </div>
                    <p className="text-[10px] text-gray-600 italic">Usada para geração de descrições e suporte inteligente.</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Activity size={12} /> Analytics ID
                      </label>
                      <input 
                        type="text" 
                        value={config.analyticsId} 
                        onChange={e => setConfig({...config, analyticsId: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Globe size={12} /> Gateway Endpoint
                      </label>
                      <input 
                        type="text" 
                        value={config.mockExternalApi} 
                        onChange={e => setConfig({...config, mockExternalApi: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <MapPin size={12} /> ViaCEP API URL
                      </label>
                      <input 
                        type="text" 
                        value={config.viacepApiUrl} 
                        onChange={e => setConfig({...config, viacepApiUrl: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-start gap-4">
                    <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                    <p className="text-[10px] text-gray-500 leading-relaxed">
                      <span className="text-amber-500 font-bold">AVISO:</span> Alterar o Gateway Endpoint pode interromper o processamento de pagamentos em tempo real se o novo endereço não for compatível com o protocolo Chronos-Pay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Developer & Company Info */}
              <div className="space-y-8">
                <div className="flex items-center gap-3 mb-8">
                  <Info className="text-gold" size={24} />
                  <h3 className="text-xl font-bold text-white uppercase tracking-widest">Identidade & Branding</h3>
                </div>

                <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <UserIcon size={12} /> Nome do Desenvolvedor
                      </label>
                      <input 
                        type="text" 
                        value={config.devName} 
                        onChange={e => setConfig({...config, devName: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Terminal size={12} /> Cargo / Role
                      </label>
                      <input 
                        type="text" 
                        value={config.devRole} 
                        onChange={e => setConfig({...config, devRole: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <ExternalLink size={12} /> Link do Desenvolvedor (Portfólio/GitHub)
                      </label>
                      <input 
                        type="text" 
                        value={config.devLink} 
                        onChange={e => setConfig({...config, devLink: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-gold font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Building size={12} /> Nome da Empresa
                      </label>
                      <input 
                        type="text" 
                        value={config.companyName} 
                        onChange={e => setConfig({...config, companyName: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Globe size={12} /> Link da Empresa
                      </label>
                      <input 
                        type="text" 
                        value={config.companyLink} 
                        onChange={e => setConfig({...config, companyLink: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Settings size={12} /> Versão do App
                      </label>
                      <input 
                        type="text" 
                        value={config.appVersion} 
                        onChange={e => setConfig({...config, appVersion: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                        <Activity size={12} /> Status do Sistema
                      </label>
                      <select 
                        value={config.systemStatus} 
                        onChange={e => setConfig({...config, systemStatus: e.target.value as any})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 outline-none focus:border-gold transition-all text-white font-mono text-xs appearance-none"
                      >
                        <option value="stable">Stable</option>
                        <option value="beta">Beta</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* External Connections Section */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3 mb-8">
                <Globe className="text-gold" size={24} />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Conexões Externas</h3>
              </div>

              <div className="space-y-4">
                {externalConnections.map((conn, idx) => (
                  <motion.div 
                    key={conn.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-gold/30 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-gold transition-colors">
                          <ExternalLink size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">{conn.name}</h4>
                      </div>
                      <Badge variant={conn.status === 'Ativo' ? 'success' : 'warning'}>
                        {conn.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed mb-4">{conn.purpose}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{conn.type}</span>
                      <span className="text-[9px] font-mono text-gold/50 truncate max-w-[150px]">{conn.url}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-time Logs Section */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <List className="text-gold" size={24} />
                <h3 className="text-xl font-bold text-white uppercase tracking-widest">Logs em Tempo Real</h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsLogging(!isLogging)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                    isLogging ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                  )}
                >
                  {isLogging ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                  {isLogging ? 'Pausar Logs' : 'Retomar Logs'}
                </button>
                <button 
                  onClick={() => setLogs([])}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <Trash2 size={12} /> Limpar
                </button>
              </div>
            </div>

            <div className="bg-black border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-white/5 px-6 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">chronos_system_monitor.log</span>
              </div>
              <div className="h-[400px] overflow-y-auto p-6 font-mono text-[11px] space-y-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-700 italic">
                    Nenhum log registrado no momento...
                  </div>
                ) : (
                  logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-4 group"
                    >
                      <span className="text-gray-600 shrink-0">[{log.timestamp}]</span>
                      <span className={cn(
                        "font-bold uppercase shrink-0 w-12",
                        log.level === 'info' ? "text-blue-400" : 
                        log.level === 'warn' ? "text-amber-400" : "text-red-400"
                      )}>
                        {log.level}
                      </span>
                      <span className="text-gray-400 group-hover:text-white transition-colors">{log.message}</span>
                    </motion.div>
                  ))
                )}
              </div>
              <form onSubmit={handleCommand} className="bg-white/5 p-4 border-t border-white/10 flex items-center gap-4">
                <span className="text-gold font-bold text-sm">$</span>
                <input 
                  type="text" 
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Digite um comando... (ex: /help)"
                  className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-gray-700 font-mono"
                />
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Enter para executar</div>
              </form>
            </div>
          </div>

          {/* System Status */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <Database className="text-gold" size={20} />
                <span className="text-[10px] font-bold text-green-500 uppercase">Online</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Local Storage DB</h4>
              <div className="w-full bg-black h-1 rounded-full overflow-hidden">
                <div className="bg-gold h-full w-[65%]" />
              </div>
              <p className="text-[10px] text-gray-600">Espaço utilizado: 1.2MB / 5.0MB</p>
            </div>
            
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <Settings className="text-gold" size={20} />
                <span className="text-[10px] font-bold text-green-500 uppercase">Otimizado</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Vite Build Engine</h4>
              <div className="flex gap-1">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="h-4 w-1 bg-gold/20 rounded-full" />
                ))}
              </div>
              <p className="text-[10px] text-gray-600">Tempo de compilação: 142ms</p>
            </div>

            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <Activity className="text-gold" size={20} />
                <span className="text-[10px] font-bold text-gold uppercase">Monitorando</span>
              </div>
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">HMR Status</h4>
              <p className="text-[10px] text-gray-600 leading-relaxed">
                Hot Module Replacement desativado pelo ambiente de produção AI Studio.
              </p>
            </div>
          </div>

        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/10 text-center space-y-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
          Chronos Developer Environment &copy; 2026 • Acesso Restrito
        </p>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] text-gray-700 uppercase tracking-widest">
            Desenvolvido por <a href={config.devLink} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{config.devName}</a>
          </p>
          <p className="text-[9px] text-gray-700 uppercase tracking-widest">
            <a href={config.companyLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{config.companyName}</a> • v{config.appVersion} • Status: <span className={cn(
              config.systemStatus === 'stable' ? 'text-green-500' : 
              config.systemStatus === 'beta' ? 'text-amber-500' : 'text-red-500'
            )}>{config.systemStatus}</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
