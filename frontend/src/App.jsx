import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Upload, TrendingUp, MessageSquare, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const AIChat = () => {
  const [query, setQuery] = React.useState('');
  const [messages, setMessages] = React.useState([
    { role: 'ai', text: 'Hello! I am your AI financial assistant. Ask me anything about your spending or portfolio.' }
  ]);
  const [loading, setLoading] = React.useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMsg = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <div className="p-4 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
        <h3 className="text-white font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          AI Financial Assistant
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-400 italic px-2">AI is thinking...</div>}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 flex gap-2">
        <input 
          value={query} 
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
          <TrendingUp className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('http://127.0.0.1:8080/api/transactions')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const categoryData = data.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
      existing.value += Math.abs(curr.amount);
    } else {
      acc.push({ name: curr.category, value: Math.abs(curr.amount) });
    }
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const totalSpent = data.reduce((sum, item) => sum + Math.abs(item.amount), 0);

  if (loading) return <div className="p-8 text-gray-500">Loading your finances...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
        <p className="text-gray-500 mt-2">AI-categorized overview of your spending.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Volume</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Transactions</p>
          <p className="text-3xl font-bold mt-2 text-gray-900">{data.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Spending by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="text-lg font-bold mb-6 text-gray-800">Recent Transactions</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {data.slice(-10).reverse().map((t) => (
                <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-400">{t.date} • {t.category}</p>
                  </div>
                  <p className="font-bold text-gray-900">-${Math.abs(t.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <AIChat />
        </div>
      </div>
    </div>
  );
};

const UploadCSV = () => {
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState('');

  const handleUpload = async () => {
    if (!file) return;
    setStatus('Uploading and categorizing with AI...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8080/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setStatus(`Success! Saved ${data.successfully_saved} transactions.`);
      } else {
        setStatus(`Error: ${data.detail || 'Upload failed'}`);
      }
    } catch (error) {
      setStatus('Error connecting to backend. Make sure the server is running on port 8080.');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Upload Statement</h1>
      <p className="text-gray-600">Upload your bank CSV to categorize transactions with AI.</p>
      
      <div className="mt-8 max-w-xl bg-white p-10 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <input 
          type="file" 
          accept=".csv" 
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        <button 
          onClick={handleUpload}
          disabled={!file}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
        >
          Process Statement
        </button>
        {status && (
          <p className={`mt-6 text-sm font-medium px-4 py-2 rounded-lg ${status.startsWith('Error') ? 'text-red-600 bg-red-50' : 'text-blue-600 bg-blue-50'}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

const Investments = () => {
  const [stocks, setStocks] = React.useState([]);
  const [ticker, setTicker] = React.useState('');
  const [qty, setQty] = React.useState('');
  const [price, setPrice] = React.useState('');

  const fetchPortfolio = () => {
    fetch('http://127.0.0.1:8080/api/portfolio')
      .then(res => res.json())
      .then(setStocks);
  };

  React.useEffect(fetchPortfolio, []);

  const handleAddStock = async (e) => {
    e.preventDefault();
    await fetch('http://127.0.0.1:8080/api/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, quantity: parseFloat(qty), average_price: parseFloat(price) }),
    });
    setTicker(''); setQty(''); setPrice('');
    fetchPortfolio();
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Stock Portfolio</h1>
      
      {/* Add Stock Form */}
      <form onSubmit={handleAddStock} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-end mb-10">
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ticker</label>
          <input value={ticker} onChange={e => setTicker(e.target.value)} placeholder="AAPL" className="w-full border-gray-200 border p-2 rounded-lg" required />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Quantity</label>
          <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="10" className="w-full border-gray-200 border p-2 rounded-lg" required />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Avg Price</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="150" className="w-full border-gray-200 border p-2 rounded-lg" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Add Stock</button>
      </form>

      {/* Portfolio Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase">Ticker</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Qty</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Current Price</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Profit/Loss</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold text-gray-900">{s.ticker}</td>
                <td className="p-4 text-right text-gray-600">{s.quantity}</td>
                <td className="p-4 text-right text-gray-900 font-semibold">${s.current_price}</td>
                <td className={`p-4 text-right font-bold ${s.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {s.profit_loss >= 0 ? '+' : ''}${s.profit_loss.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6">
            <h2 className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              AI Finance
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <Link to="/" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link to="/upload" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
              <Upload className="w-5 h-5" />
              Upload CSV
            </Link>
            <Link to="/investments" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all">
              <TrendingUp className="w-5 h-5" />
              Investments
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadCSV />} />
            <Route path="/investments" element={<Investments />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
