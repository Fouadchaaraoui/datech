/* DATECH GESTION PRO — static GitHub Pages client. RLS remains the data boundary. */
const SUPABASE_URL = 'https://pxflyhtiiijfenjmtzdt.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_wnNRLgQRGbKUTCom-C6LWA_fi307T4J';
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const money = n => new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(n || 0));
const date = d => d ? new Date(`${d}T00:00:00`).toLocaleDateString('fr-MA') : '—';
const today = () => new Date().toISOString().slice(0, 10);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

const labels = {
  fr: { dashboard:'Tableau de bord', clients:'Clients', products:'Produits & services', stock:'Stock', invoices:'Factures', expenses:'Dépenses', settings:'Paramètres', newClient:'Nouveau client', newProduct:'Nouveau produit', newInvoice:'Nouvelle facture', newExpense:'Nouvelle dépense', search:'Rechercher…', add:'Ajouter', name:'Nom', phone:'Téléphone', email:'Email', address:'Adresse', ice:'ICE', notes:'Notes', description:'Description', sku:'Référence', type:'Type', price:'Prix de vente', cost_price:'Prix d’achat', stock_quantity:'Quantité en stock', min_stock:'Seuil minimum', title:'Libellé', category:'Catégorie', amount:'Montant', expense_date:'Date', payment_method:'Mode de paiement', business_name:'Nom de l’entreprise', if_number:'IF', rc:'RC', patente:'Patente', default_tax_rate:'TVA par défaut (%)', currency:'Devise', save:'Enregistrer', cancel:'Annuler', client_id:'Client', invoice_number:'N° facture', invoice_date:'Date facture', due_date:'Échéance', status:'Statut', subtotal:'Sous-total', discount:'Remise', tax_rate:'TVA (%)', amount_paid:'Montant payé', service:'Service', product:'Produit', draft:'Brouillon', sent:'Envoyée', paid:'Payée', partial:'Partielle', cancelled:'Annulée', noData:'Aucune donnée pour le moment.', actions:'Actions', total:'Total', revenue:'Chiffre d’affaires', expensesSum:'Dépenses', profit:'Résultat net', clientsCount:'Clients', recentInvoices:'Factures récentes', lowStock:'Stock à surveiller', quick:'Actions rapides', print:'Imprimer / PDF', addLine:'Ajouter une ligne', qty:'Qté', unit_price:'Prix unitaire', line_total:'Total ligne' },
  ar: { dashboard:'لوحة القيادة', clients:'الزبناء', products:'المنتجات والخدمات', stock:'المخزون', invoices:'الفواتير', expenses:'المصاريف', settings:'الإعدادات', newClient:'زبون جديد', newProduct:'منتج جديد', newInvoice:'فاتورة جديدة', newExpense:'مصروف جديد', search:'بحث…', add:'إضافة', name:'الاسم', phone:'الهاتف', email:'البريد الإلكتروني', address:'العنوان', ice:'ICE', notes:'ملاحظات', description:'الوصف', sku:'المرجع', type:'النوع', price:'ثمن البيع', cost_price:'ثمن الشراء', stock_quantity:'الكمية في المخزون', min_stock:'الحد الأدنى', title:'العنوان', category:'الفئة', amount:'المبلغ', expense_date:'التاريخ', payment_method:'طريقة الأداء', business_name:'اسم الشركة', if_number:'IF', rc:'RC', patente:'Patente', default_tax_rate:'الضريبة الافتراضية (%)', currency:'العملة', save:'حفظ', cancel:'إلغاء', client_id:'الزبون', invoice_number:'رقم الفاتورة', invoice_date:'تاريخ الفاتورة', due_date:'تاريخ الاستحقاق', status:'الحالة', subtotal:'المجموع الجزئي', discount:'التخفيض', tax_rate:'الضريبة (%)', amount_paid:'المبلغ المدفوع', service:'خدمة', product:'منتج', draft:'مسودة', sent:'مرسلة', paid:'مؤداة', partial:'جزئية', cancelled:'ملغاة', noData:'لا توجد بيانات حالياً.', actions:'الإجراءات', total:'المجموع', revenue:'المداخيل', expensesSum:'المصاريف', profit:'النتيجة الصافية', clientsCount:'الزبناء', recentInvoices:'الفواتير الأخيرة', lowStock:'مخزون منخفض', quick:'إجراءات سريعة', print:'طباعة / PDF', addLine:'إضافة سطر', qty:'الكمية', unit_price:'ثمن الوحدة', line_total:'مجموع السطر' }
};

const state = { user: null, page: 'dashboard', lang: 'fr', data: {}, settings: null, invoiceLines: [] };
const schemas = {
  clients: ['name','phone','email','address','ice','notes'],
  products: ['name','description','sku','type','price','cost_price','stock_quantity','min_stock'],
  expenses: ['title','category','amount','expense_date','payment_method','notes'],
  settings: ['business_name','address','phone','email','ice','if_number','rc','patente','logo_url','currency','default_tax_rate']
};
const defaults = { clients:{name:'',phone:'',email:'',address:'',ice:'',notes:''}, products:{name:'',description:'',sku:'',type:'product',price:0,cost_price:0,stock_quantity:0,min_stock:0}, expenses:{title:'',category:'',amount:0,expense_date:today(),payment_method:'',notes:''}, settings:{business_name:'DATECH',address:'',phone:'',email:'',ice:'',if_number:'',rc:'',patente:'',logo_url:'',currency:'MAD',default_tax_rate:0} };

function tr(key) { return labels[state.lang][key] || key; }
function setError(el, message) { el.textContent = message || ''; }
function showLogin() { $('#login-screen').classList.remove('hidden'); $('#app').classList.add('hidden'); }
function showApp(user) { state.user = user; $('#login-screen').classList.add('hidden'); $('#app').classList.remove('hidden'); $('#user-email').textContent = user.email || ''; $('#today').textContent = new Date().toLocaleDateString(state.lang === 'ar' ? 'ar-MA' : 'fr-MA', { dateStyle:'full' }); navigate(state.page); }

$('#login-form').addEventListener('submit', async e => {
  e.preventDefault(); setError($('#login-error'), ''); const fd = new FormData(e.currentTarget);
  const { error } = await db.auth.signInWithPassword({ email: fd.get('email'), password: fd.get('password') });
  if (error) setError($('#login-error'), error.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : error.message);
});
$('#logout').addEventListener('click', async () => { await db.auth.signOut(); state.user = null; showLogin(); });
db.auth.onAuthStateChange((_event, session) => { if (session?.user) showApp(session.user); else showLogin(); });
$('#navigation').addEventListener('click', e => { const b = e.target.closest('[data-page]'); if (b) navigate(b.dataset.page); });
$('#menu-toggle').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#language-toggle').addEventListener('click', () => { state.lang = state.lang === 'fr' ? 'ar' : 'fr'; document.documentElement.lang = state.lang; document.body.classList.toggle('rtl', state.lang === 'ar'); $('#language-toggle').textContent = state.lang === 'fr' ? 'العربية' : 'Français'; navigate(state.page); });

async function select(table, columns='*', order) {
  let q = db.from(table).select(columns);
  if (order) q = q.order(order, { ascending:false });
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}
async function refresh() {
  const [clients, products, invoices, expenses, settings] = await Promise.all([
    select('clients','*','created_at'), select('products','*','created_at'), select('invoices','*','invoice_date'), select('expenses','*','expense_date'), select('business_settings')
  ]);
  state.data = { clients, products, invoices, expenses };
  state.settings = settings[0] || { ...defaults.settings };
}
async function navigate(page) {
  state.page = page; $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.page === page));
  const title = tr(page); $('#page-title').textContent = title; $('.sidebar').classList.remove('open');
  $('#page-content').innerHTML = '<div class="empty">Chargement…</div>';
  try { await refresh(); renderPage(); }
  catch (err) { $('#page-content').innerHTML = `<div class="panel error-panel"><b>Impossible de charger les données.</b><p>${esc(err.message)}. Vérifiez la connexion et les droits RLS.</p></div>`; }
}
function pageHeading(title, action, onClick) { return `<div class="page-heading"><h2>${title}</h2>${action ? `<button class="button primary" id="page-add">＋ ${action}</button>` : ''}</div>`; }
function renderPage() {
  const root = $('#page-content');
  if (state.page === 'dashboard') root.innerHTML = dashboard();
  else if (state.page === 'clients') root.innerHTML = tablePage('clients', schemas.clients, tr('newClient'));
  else if (state.page === 'products') root.innerHTML = tablePage('products', schemas.products, tr('newProduct'));
  else if (state.page === 'stock') root.innerHTML = stockPage();
  else if (state.page === 'invoices') root.innerHTML = invoicePage();
  else if (state.page === 'expenses') root.innerHTML = tablePage('expenses', schemas.expenses, tr('newExpense'));
  else if (state.page === 'settings') root.innerHTML = settingsPage();
  bindPageEvents();
}
function dashboard() {
  const { invoices=[], expenses=[], clients=[], products=[] } = state.data;
  const rev = invoices.filter(x=>x.status==='paid'||x.status==='partial').reduce((s,x)=>s+Number(x.amount_paid||0),0);
  const exp = expenses.reduce((s,x)=>s+Number(x.amount||0),0);
  const low = products.filter(p=>p.type==='product'&&Number(p.stock_quantity)<=Number(p.min_stock));
  const stats = [[tr('revenue'),money(rev),'↗'],[tr('expensesSum'),money(exp),'↘'],[tr('profit'),money(rev-exp),'◇'],[tr('clientsCount'),clients.length,'♙']];
  const latest = [...invoices].sort((a,b)=>String(b.invoice_date).localeCompare(String(a.invoice_date))).slice(0,5);
  return `<div class="cards">${stats.map(([label,val,icon])=>`<article class="stat-card"><span class="stat-icon">${icon}</span><div class="stat-label">${label}</div><div class="stat-value">${val}</div><div class="stat-note">${state.lang==='fr'?'Données à jour':'بيانات محينة'}</div></article>`).join('')}</div>
  <div class="dashboard-grid"><section class="panel"><h3>${tr('recentInvoices')}</h3>${latest.length ? invoiceTable(latest) : `<div class="empty">${tr('noData')}</div>`}</section><section class="panel"><h3>${tr('quick')}</h3><div class="quick-actions"><button data-go="invoices">＋ ${tr('newInvoice')}</button><button data-add="clients">＋ ${tr('newClient')}</button><button data-add="products">＋ ${tr('newProduct')}</button><button data-add="expenses">＋ ${tr('newExpense')}</button></div><h3 style="margin-top:24px">${tr('lowStock')}</h3>${low.length?low.slice(0,5).map(p=>`<p>${esc(p.name)} <b>${esc(p.stock_quantity)}</b></p>`).join(''):`<div class="empty">${state.lang==='fr'?'Alerte stock vide.':'لا توجد تنبيهات.'}</div>`}</section></div>`;
}
function invoiceTable(rows) { return `<div class="table-wrap"><table><thead><tr><th>${tr('invoice_number')}</th><th>${tr('invoice_date')}</th><th>${tr('status')}</th><th>${tr('total')}</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${esc(x.invoice_number)}</td><td>${date(x.invoice_date)}</td><td><span class="badge ${x.status==='paid'?'':'warn'}">${tr(x.status)}</span></td><td>${money(x.total)}</td><td><button class="text-button" data-print="${esc(x.id)}">${tr('print')}</button></td></tr>`).join('')}</tbody></table></div>`; }
function tablePage(table, fields, addLabel) {
  const rows = state.data[table] || [];
  return `${pageHeading(tr(table),addLabel)}<div class="table-wrap"><table><thead><tr>${fields.slice(0,6).map(k=>`<th>${tr(k)}</th>`).join('')}<th>${tr('actions')}</th></tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${fields.slice(0,6).map(k=>`<td>${k.includes('date')?date(row[k]):k==='amount'||k==='price'?money(row[k]):esc(k==='type'?tr(row[k]):row[k])}</td>`).join('')}<td><div class="row-actions"><button class="text-button" data-edit="${table}" data-id="${row.id}">Modifier</button><button class="text-button danger" data-delete="${table}" data-id="${row.id}">Supprimer</button></div></td></tr>`).join(''):`<tr><td colspan="${fields.length+1}" class="empty">${tr('noData')}</td></tr>`}</tbody></table></div><p class="muted">${rows.length} ${tr(table).toLowerCase()}</p>`;
}
function stockPage() {
  const rows=state.data.products.filter(p=>p.type==='product');
  return `${pageHeading(tr('stock'))}<div class="table-wrap"><table><thead><tr><th>${tr('name')}</th><th>${tr('sku')}</th><th>${tr('stock_quantity')}</th><th>${tr('min_stock')}</th><th>${tr('price')}</th><th>État</th><th>${tr('actions')}</th></tr></thead><tbody>${rows.length?rows.map(p=>{const low=Number(p.stock_quantity)<=Number(p.min_stock);return `<tr><td>${esc(p.name)}</td><td>${esc(p.sku||'—')}</td><td>${esc(p.stock_quantity)}</td><td>${esc(p.min_stock)}</td><td>${money(p.price)}</td><td><span class="badge ${low?'danger':''}">${low?'À réapprovisionner':'Disponible'}</span></td><td><button class="text-button" data-edit="products" data-id="${p.id}">Modifier</button></td></tr>`}).join(''):`<tr><td colspan="7" class="empty">${tr('noData')}</td></tr>`}</tbody></table></div>`;
}
function invoicePage() { const rows=state.data.invoices||[];return `${pageHeading(tr('invoices'),tr('newInvoice'))}${rows.length?invoiceTable(rows):`<div class="panel empty">${tr('noData')}</div>`}`; }
function settingsPage() {
  const s=state.settings||defaults.settings;
  return `${pageHeading(tr('settings'))}<div class="settings-grid"><section class="panel"><h3>Informations de l’entreprise</h3><form id="settings-form" class="form-grid">${schemas.settings.map(k=>field(k,s[k])).join('')}<div class="field full-width"><button class="button primary">${tr('save')}</button></div></form></section><section class="panel"><h3>Compte et sécurité</h3><p class="muted">Connexion privée par email et mot de passe. Les inscriptions publiques sont désactivées dans Supabase. Chaque lecture et écriture est filtrée par les règles RLS du compte.</p><p><b>${esc(state.user?.email)}</b></p><button id="settings-logout" class="button ghost">Déconnexion</button></section></div>`;
}
function field(key,value,wide=false) {
  const numeric=['price','cost_price','stock_quantity','min_stock','amount','default_tax_rate','discount','tax_rate','amount_paid','quantity','unit_price'].includes(key);
  const dateField=key.includes('date'); let type=numeric?'number':dateField?'date':key==='email'?'email':'text';
  let input;
  if(key==='type') input=`<select name="${key}"><option value="product" ${value==='product'?'selected':''}>${tr('product')}</option><option value="service" ${value==='service'?'selected':''}>${tr('service')}</option></select>`;
  else if(key==='status') input=`<select name="${key}">${['draft','sent','paid','partial','cancelled'].map(x=>`<option value="${x}" ${x===value?'selected':''}>${tr(x)}</option>`).join('')}</select>`;
  else if(key==='notes'||key==='description'||key==='address') input=`<textarea name="${key}">${esc(value||'')}</textarea>`;
  else input=`<input name="${key}" type="${type}" value="${esc(value??'')}" ${numeric?'step="0.01" min="0"':''} ${['name','business_name','title'].includes(key)?'required':''}>`;
  return `<label class="field ${wide?'full-width':''}">${tr(key)}${input}</label>`;
}
function bindPageEvents() {
  $('#page-add')?.addEventListener('click',()=>state.page==='invoices'?openInvoice():openEditor(state.page==='expenses'?'expenses':state.page==='clients'?'clients':'products'));
  $$('[data-go]').forEach(b=>b.onclick=()=>navigate(b.dataset.go));
  $$('[data-add]').forEach(b=>b.onclick=()=>openEditor(b.dataset.add));
  $$('[data-edit]').forEach(b=>b.onclick=()=>openEditor(b.dataset.edit,b.dataset.id));
  $$('[data-delete]').forEach(b=>b.onclick=()=>removeRow(b.dataset.delete,b.dataset.id));
  $$('[data-print]').forEach(b=>b.onclick=()=>printInvoice(b.dataset.print));
  $('#settings-form')?.addEventListener('submit',saveSettings);
  $('#settings-logout')?.addEventListener('click',()=>$('#logout').click());
}
function openEditor(table,id) {
  const row=id?(state.data[table]||[]).find(x=>x.id===id):defaults[table]; if(!row)return;
  $('#editor-title').textContent=id?'Modifier':'Ajouter'; $('#editor-error').textContent='';
  $('#editor-fields').innerHTML=schemas[table].map(k=>field(k,row[k],['address','notes','description'].includes(k))).join('');
  const dialog=$('#editor'); dialog.showModal();
  $('#editor-form').onsubmit=async e=>{ e.preventDefault(); const fd=new FormData(e.currentTarget); const payload={}; schemas[table].forEach(k=>payload[k]=fd.get(k)||null); ['price','cost_price','stock_quantity','min_stock','amount'].forEach(k=>{if(k in payload)payload[k]=Number(payload[k]||0)}); $('#editor-save').disabled=true; const {error}=id?await db.from(table).update(payload).eq('id',id):await db.from(table).insert(payload); $('#editor-save').disabled=false; if(error){$('#editor-error').textContent=error.message;return;} dialog.close();await navigate(state.page); };
}
async function removeRow(table,id) { if(!confirm('Supprimer cet élément ?'))return;const {error}=await db.from(table).delete().eq('id',id);if(error)alert(error.message);else navigate(state.page); }
async function saveSettings(e) {
  e.preventDefault();const fd=new FormData(e.currentTarget);const payload={};schemas.settings.forEach(k=>payload[k]=fd.get(k)||null);payload.default_tax_rate=Number(payload.default_tax_rate||0);
  const result=state.settings?.id?await db.from('business_settings').update(payload).eq('id',state.settings.id):await db.from('business_settings').insert(payload);
  if(result.error)alert(result.error.message);else{await navigate('settings');alert('Paramètres enregistrés.');}
}

async function openInvoice() {
  state.invoiceLines=[{description:'',quantity:1,unit_price:0,discount:0,product_id:null}];
  $('#editor-title').textContent=tr('newInvoice');$('#editor-error').textContent='';
  const clients=state.data.clients||[];const products=state.data.products||[];
  $('#editor-fields').innerHTML=`<label class="field">${tr('client_id')}<select name="client_id"><option value="">—</option>${clients.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('')}</select></label>${field('invoice_number',`FAC-${new Date().getFullYear()}-${String((state.data.invoices||[]).length+1).padStart(4,'0')}`)}${field('invoice_date',today())}${field('due_date','')}${field('status','draft')}${field('discount',0)}${field('tax_rate',Number(state.settings?.default_tax_rate||0))}<div class="field full-width"><b>${tr('addLine')}</b><div id="invoice-lines"></div><button type="button" class="button ghost" id="add-line">＋ ${tr('addLine')}</button></div><div class="field full-width"><label>${tr('notes')}<textarea name="notes"></textarea></label></div><div class="invoice-total full-width" id="invoice-total">${tr('total')}: ${money(0)}</div>`;
  const renderLines=()=>{ $('#invoice-lines').innerHTML=state.invoiceLines.map((line,i)=>`<div class="invoice-line"><label class="field">${tr('description')}<input data-line="${i}" data-key="description" value="${esc(line.description)}" required></label><label class="field">${tr('qty')}<input data-line="${i}" data-key="quantity" type="number" min="0.01" step="0.01" value="${line.quantity}"></label><label class="field">${tr('unit_price')}<input data-line="${i}" data-key="unit_price" type="number" min="0" step="0.01" value="${line.unit_price}"></label><button type="button" class="text-button danger" data-remove-line="${i}">×</button><select data-product="${i}" aria-label="Choisir un produit"><option value="">Produit/service…</option>${products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join('')}</select><span>${tr('line_total')}: ${money(line.quantity*line.unit_price)}</span></div>`).join(''); updateInvoiceTotal();
    $$('[data-line]').forEach(input=>input.oninput=()=>{const i=Number(input.dataset.line),k=input.dataset.key;state.invoiceLines[i][k]=k==='description'?input.value:Number(input.value||0);updateInvoiceTotal();});
    $$('[data-product]').forEach(sel=>sel.onchange=()=>{const p=products.find(x=>x.id===sel.value),i=Number(sel.dataset.product);if(p){state.invoiceLines[i].product_id=p.id;state.invoiceLines[i].description=p.name;state.invoiceLines[i].unit_price=Number(p.price);renderLines();}});
    $$('[data-remove-line]').forEach(btn=>btn.onclick=()=>{state.invoiceLines.splice(Number(btn.dataset.removeLine),1);if(!state.invoiceLines.length)state.invoiceLines.push({description:'',quantity:1,unit_price:0,discount:0,product_id:null});renderLines();});
  };
  const updateInvoiceTotal=()=>{const subtotal=state.invoiceLines.reduce((s,l)=>s+Number(l.quantity||0)*Number(l.unit_price||0),0);const discount=Number($('#editor-fields [name="discount"]')?.value||0);const rate=Number($('#editor-fields [name="tax_rate"]')?.value||0);$('#invoice-total').textContent=`${tr('total')}: ${money((subtotal-discount)*(1+rate/100))}`;};
  renderLines();$('#editor-fields [name="discount"]').oninput=updateInvoiceTotal;$('#editor-fields [name="tax_rate"]').oninput=updateInvoiceTotal;
  $('#add-line').onclick=()=>{state.invoiceLines.push({description:'',quantity:1,unit_price:0,discount:0,product_id:null});renderLines();};
  $('#editor').showModal();
  $('#editor-form').onsubmit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const subtotal=state.invoiceLines.reduce((s,l)=>s+Number(l.quantity)*Number(l.unit_price),0),discount=Number(fd.get('discount')||0),taxRate=Number(fd.get('tax_rate')||0),taxAmount=(subtotal-discount)*taxRate/100,total=subtotal-discount+taxAmount;
    if(state.invoiceLines.some(l=>!l.description||Number(l.quantity)<=0)){ $('#editor-error').textContent='Chaque ligne doit avoir une description et une quantité positive.';return; }
    $('#editor-save').disabled=true;const inv={client_id:fd.get('client_id')||null,invoice_number:fd.get('invoice_number'),invoice_date:fd.get('invoice_date')||today(),due_date:fd.get('due_date')||null,status:fd.get('status')||'draft',subtotal,discount,tax_rate:taxRate,tax_amount:taxAmount,total,amount_paid:0,currency:'MAD',notes:fd.get('notes')||null};
    const {data,error}=await db.from('invoices').insert(inv).select().single();if(error){$('#editor-error').textContent=error.message;$('#editor-save').disabled=false;return;}
    const items=state.invoiceLines.map(l=>({invoice_id:data.id,product_id:l.product_id,description:l.description,quantity:l.quantity,unit_price:l.unit_price,discount:l.discount||0,line_total:Number(l.quantity)*Number(l.unit_price)-Number(l.discount||0)}));
    const saved=await db.from('invoice_items').insert(items);if(saved.error){$('#editor-error').textContent=`Facture créée, mais lignes non enregistrées : ${saved.error.message}`;$('#editor-save').disabled=false;return;}
    $('#editor').close();await navigate('invoices');
  };
}
async function printInvoice(id) {
  const inv=(state.data.invoices||[]).find(x=>x.id===id);if(!inv)return;
  const [{data:items,error},clients]=await Promise.all([db.from('invoice_items').select('*').eq('invoice_id',id),Promise.resolve(state.data.clients)]);if(error){alert(error.message);return;}
  const client=clients.find(c=>c.id===inv.client_id),s=state.settings||defaults.settings;
  const w=window.open('','_blank');if(!w){alert('Autorisez la fenêtre d’impression pour créer le PDF.');return;}
  w.document.write(`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Facture ${esc(inv.invoice_number)}</title><style>body{font:14px Arial,sans-serif;color:#172534;padding:40px;max-width:850px;margin:auto}header{display:flex;justify-content:space-between;border-bottom:3px solid #15313b;padding-bottom:20px}h1{color:#173b43}.muted{color:#657483}table{width:100%;border-collapse:collapse;margin:35px 0}th,td{text-align:left;border-bottom:1px solid #ddd;padding:12px}th{background:#f3f6f7}.total{text-align:right;font-size:20px;font-weight:bold}.bottom{margin-top:60px;color:#657483;border-top:1px solid #ddd;padding-top:18px}@media print{button{display:none}body{padding:0}}</style><header><div><h1>${esc(s.business_name||'DATECH')}</h1><div>${esc(s.address||'')}</div><div>${esc(s.phone||'')} · ${esc(s.email||'')}</div><div>ICE: ${esc(s.ice||'—')} · IF: ${esc(s.if_number||'—')}</div></div><div><h2>FACTURE</h2><b>${esc(inv.invoice_number)}</b><p>Date : ${date(inv.invoice_date)}</p><p>Échéance : ${date(inv.due_date)}</p></div></header><h3>Client</h3><div>${esc(client?.name||'Client')}</div><div>${esc(client?.address||'')}</div><div>${esc(client?.phone||'')} ${client?.ice?`· ICE ${esc(client.ice)}`:''}</div><table><thead><tr><th>Description</th><th>Qté</th><th>Prix unitaire</th><th>Total</th></tr></thead><tbody>${(items||[]).map(i=>`<tr><td>${esc(i.description)}</td><td>${esc(i.quantity)}</td><td>${money(i.unit_price)}</td><td>${money(i.line_total)}</td></tr>`).join('')}</tbody></table><p>Sous-total : ${money(inv.subtotal)}</p><p>Remise : ${money(inv.discount)}</p><p>TVA (${esc(inv.tax_rate)}%) : ${money(inv.tax_amount)}</p><p class="total">Total : ${money(inv.total)}</p><div class="bottom">Merci pour votre confiance — ${esc(s.business_name||'DATECH')}</div><script>window.onload=()=>window.print()<\/script></html>`);w.document.close();
}

