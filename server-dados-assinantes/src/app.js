const initialSubscribers=[
{id:1,nome:"Mariana Costa",idade:42,endereco:"Rua das Flores, 120 - São Paulo/SP",telefone:"(11) 98888-1212",email:"mariana@email.com",dataAtivacao:"2026-01-10",periodo:"Mensal",valor:39.90},
{id:2,nome:"Roberto Almeida",idade:55,endereco:"Av. Brasil, 800 - Salvador/BA",telefone:"(71) 97777-3434",email:"roberto@email.com",dataAtivacao:"2025-11-03",periodo:"Anual",valor:359.90},
{id:3,nome:"Camila Ribeiro",idade:31,endereco:"Rua Augusta, 45 - São Paulo/SP",telefone:"(11) 96666-0909",email:"camila@email.com",dataAtivacao:"2026-02-18",periodo:"Trimestral",valor:99.90},
{id:4,nome:"João Fernandes",idade:64,endereco:"Rua Chile, 22 - Salvador/BA",telefone:"(71) 95555-0101",email:"joao@email.com",dataAtivacao:"2026-03-05",periodo:"Bimestral",valor:74.90}
];

let subscribers=JSON.parse(localStorage.getItem("serverDadosAssinantes"))||initialSubscribers;
let currentTable="assinantes";

const tables=[
{name:"assinantes",records:()=>subscribers.length,type:"InnoDB",collation:"utf8mb4_unicode_ci",size:"192 KB"},
{name:"enderecos",records:()=>subscribers.length,type:"InnoDB",collation:"utf8mb4_unicode_ci",size:"128 KB"},
{name:"planos",records:()=>4,type:"InnoDB",collation:"utf8mb4_unicode_ci",size:"32 KB"},
{name:"assinaturas",records:()=>subscribers.length,type:"InnoDB",collation:"utf8mb4_unicode_ci",size:"256 KB"},
{name:"pagamentos",records:()=>subscribers.length,type:"InnoDB",collation:"utf8mb4_unicode_ci",size:"640 KB"}
];

const currency=new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"});
const notice=document.querySelector("#notice");

function save(){localStorage.setItem("serverDadosAssinantes",JSON.stringify(subscribers))}
function msg(text){notice.textContent=text}
function showView(name){
 document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
 document.querySelector(`#view-${name}`)?.classList.add("active");
 document.querySelectorAll(".topnav button").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
 msg(`Aba "${name}" aberta.`);
 if(name==="relatorios") renderMetrics();
 if(name==="pesquisar") renderSearchResults(subscribers);
}
document.querySelectorAll(".topnav button").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));

function renderTables(data=tables){
 const dbTable=document.querySelector("#dbTable");
 dbTable.innerHTML=data.map(item=>`
 <tr>
  <td><input type="checkbox" class="row-check" data-table="${item.name}"></td>
  <td><strong>${item.name}</strong></td>
  <td><div class="actions">
   <span data-action="procurar" data-table="${item.name}">Procurar</span>
   <span data-action="estrutura" data-table="${item.name}">Estrutura</span>
   <span data-action="pesquisar" data-table="${item.name}">Pesquisar</span>
   <span data-action="inserir" data-table="${item.name}">Insere</span>
   <span data-action="limpar" data-table="${item.name}">Limpa</span>
   <span data-action="eliminar" data-table="${item.name}">Elimina</span>
  </div></td>
  <td>${item.records()}</td><td>${item.type}</td><td>${item.collation}</td><td>${item.size}</td>
 </tr>`).join("");
 document.querySelector("#recordTotal").textContent=tables.reduce((s,t)=>s+t.records(),0);
 document.querySelector("#tableTotal").textContent=`${tables.length} tabelas`;
 document.querySelectorAll("[data-action]").forEach(el=>el.addEventListener("click",handleTableAction));
}

function handleTableAction(e){
 const action=e.target.dataset.action;
 const table=e.target.dataset.table;
 currentTable=table;
 updateCurrentTable();
 if(action==="procurar"||action==="pesquisar"){showView("pesquisar");msg(`Pesquisando registros da tabela ${table}.`)}
 if(action==="estrutura"){showView("estrutura");msg(`Estrutura da tabela ${table} selecionada.`)}
 if(action==="inserir"){showView("inserir");msg(`Inserção aberta para ${table}.`)}
 if(action==="limpar"){
  if(table==="assinantes" && confirm("Limpar todos os assinantes?")){subscribers=[];save();renderAll();msg("Tabela assinantes limpa.")}
  else msg(`Ação limpar simulada para ${table}.`);
 }
 if(action==="eliminar"){
  if(confirm(`Eliminar tabela ${table}? Simulação: a tabela será removida apenas da visualização.`)){msg(`Tabela ${table} marcada como eliminada na simulação.`)}
 }
}

function updateCurrentTable(){
 document.querySelector("#currentTableLabel").textContent=`Tabela: ${currentTable}`;
 document.querySelector("#recordsTitle").textContent=`Visualização: ${currentTable}`;
 document.querySelectorAll(".table-link").forEach(li=>li.classList.toggle("active",li.dataset.table===currentTable));
 renderRecords();
}

document.querySelectorAll(".table-link").forEach(li=>li.addEventListener("click",()=>{
 currentTable=li.dataset.table;updateCurrentTable();msg(`Tabela ${currentTable} selecionada.`);
}));

document.querySelectorAll(".quick-tabs button").forEach(btn=>btn.addEventListener("click",()=>msg(`${btn.dataset.panel}: assinatura e tabelas acessadas recentemente.`)));

function renderRecords(){
 const head=document.querySelector("#recordHead");
 const rows=document.querySelector("#recordRows");
 if(currentTable==="assinantes"){
  head.innerHTML=`<tr><th>id</th><th>nome</th><th>idade</th><th>endereco</th><th>telefone</th><th>email</th><th>data_ativacao</th><th>periodo</th><th>valor</th><th>ações</th></tr>`;
  rows.innerHTML=subscribers.map(s=>`<tr>
   <td>${s.id}</td><td>${s.nome}</td><td>${s.idade}</td><td>${s.endereco}</td><td>${s.telefone}</td><td>${s.email}</td><td>${s.dataAtivacao}</td><td>${s.periodo}</td><td>${currency.format(s.valor)}</td>
   <td><div class="actions"><span onclick="editSubscriber(${s.id})">Editar</span><span onclick="copySubscriber(${s.id})">Copiar</span><span onclick="deleteSubscriber(${s.id})">Eliminar</span></div></td>
  </tr>`).join("");
 } else {
  head.innerHTML=`<tr><th>campo</th><th>tipo</th><th>nulo</th><th>chave</th><th>padrão</th><th>extra</th></tr>`;
  const structure={
   enderecos:[["id_endereco","INT","NO","PRI","","AUTO_INCREMENT"],["id_assinante","INT","NO","FK","",""],["endereco","VARCHAR(255)","NO","","",""],["cidade","VARCHAR(100)","YES","","",""]],
   planos:[["id_plano","INT","NO","PRI","","AUTO_INCREMENT"],["periodo","ENUM","NO","","",""],["valor","DECIMAL(10,2)","NO","","",""]],
   assinaturas:[["id_assinatura","INT","NO","PRI","","AUTO_INCREMENT"],["id_assinante","INT","NO","FK","",""],["id_plano","INT","NO","FK","",""],["data_ativacao","DATE","NO","","",""]],
   pagamentos:[["id_pagamento","INT","NO","PRI","","AUTO_INCREMENT"],["id_assinatura","INT","NO","FK","",""],["valor_pago","DECIMAL(10,2)","NO","","",""],["status_pagamento","ENUM","YES","","Pendente",""]]
  };
  rows.innerHTML=(structure[currentTable]||[]).map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("");
 }
}

window.editSubscriber=function(id){
 const s=subscribers.find(x=>x.id===id); if(!s)return;
 const form=document.querySelector("#editForm");
 Object.keys(s).forEach(k=>{if(form.elements[k]) form.elements[k].value=s[k]});
 document.querySelector("#editModal").showModal();
}
window.copySubscriber=function(id){
 const s=subscribers.find(x=>x.id===id); if(!s)return;
 const copy={...s,id:Date.now(),nome:s.nome+" - cópia"};
 subscribers.unshift(copy);save();renderAll();msg("Registro copiado.");
}
window.deleteSubscriber=function(id){
 if(confirm("Eliminar este assinante?")){
  subscribers=subscribers.filter(s=>s.id!==id);save();renderAll();msg("Registro eliminado.");
 }
}

document.querySelector("#closeEdit").addEventListener("click",()=>document.querySelector("#editModal").close());
document.querySelector("#editForm").addEventListener("submit",e=>{
 e.preventDefault();
 const data=Object.fromEntries(new FormData(e.target).entries());
 subscribers=subscribers.map(s=>s.id==data.id?{id:Number(data.id),nome:data.nome,idade:Number(data.idade),endereco:data.endereco,telefone:data.telefone,email:data.email,dataAtivacao:data.dataAtivacao,periodo:data.periodo,valor:Number(data.valor)}:s);
 save();document.querySelector("#editModal").close();renderAll();msg("Registro atualizado.");
});

document.querySelector("#subscriberForm").addEventListener("submit",e=>{
 e.preventDefault();
 const data=Object.fromEntries(new FormData(e.target).entries());
 subscribers.unshift({id:Date.now(),nome:data.nome,idade:Number(data.idade),endereco:data.endereco,telefone:data.telefone,email:data.email,dataAtivacao:data.dataAtivacao,periodo:data.periodo,valor:Number(data.valor)});
 save();e.target.reset();currentTable="assinantes";updateCurrentTable();renderAll();msg("Novo assinante inserido com sucesso.");
});

document.querySelector("#filterInput").addEventListener("input",e=>{
 const value=e.target.value.toLowerCase();
 renderTables(tables.filter(t=>t.name.toLowerCase().includes(value)));
});

document.querySelector("#checkAll").addEventListener("change",e=>document.querySelectorAll(".row-check").forEach(c=>c.checked=e.target.checked));
document.querySelector("#runBulk").addEventListener("click",()=>{
 const selected=[...document.querySelectorAll(".row-check:checked")].map(c=>c.dataset.table);
 const action=document.querySelector("#bulkAction").value;
 if(!selected.length||!action){msg("Selecione tabelas e uma ação.");return}
 msg(`Ação "${action}" executada em: ${selected.join(", ")}.`);
});

document.querySelector("#createTableBtn").addEventListener("click",()=>{
 const name=document.querySelector("#newTableName").value.trim();
 const cols=document.querySelector("#newTableCols").value;
 if(!name){msg("Informe o nome da nova tabela.");return}
 msg(`Tabela "${name}" criada na simulação com ${cols} colunas.`);
});

document.querySelector("#subscriberSearch").addEventListener("input",e=>{
 const v=e.target.value.toLowerCase();
 const filtered=subscribers.filter(s=>Object.values(s).join(" ").toLowerCase().includes(v));
 renderSearchResults(filtered);
});
function renderSearchResults(data){
 document.querySelector("#searchResults").innerHTML=`<section class="table-panel"><table><thead><tr><th>id</th><th>nome</th><th>telefone</th><th>email</th><th>periodo</th><th>valor</th></tr></thead><tbody>${data.map(s=>`<tr><td>${s.id}</td><td>${s.nome}</td><td>${s.telefone}</td><td>${s.email}</td><td>${s.periodo}</td><td>${currency.format(s.valor)}</td></tr>`).join("")}</tbody></table></section>`;
}
document.querySelector("#goInsert").addEventListener("click",()=>showView("inserir"));
document.querySelector("#runSql").addEventListener("click",()=>{
 const sql=document.querySelector("#sqlConsole").value.toLowerCase();
 let out="";
 if(sql.includes("assinantes")) out=JSON.stringify(subscribers,null,2);
 else out="Consulta simulada executada com sucesso.";
 document.querySelector("#sqlOutput").textContent=out;msg("SQL executado.");
});
document.querySelector("#exportCsv").addEventListener("click",()=>{
 const header="id,nome,idade,endereco,telefone,email,data_ativacao,periodo,valor\n";
 const csv=header+subscribers.map(s=>`${s.id},"${s.nome}",${s.idade},"${s.endereco}","${s.telefone}","${s.email}",${s.dataAtivacao},${s.periodo},${s.valor}`).join("\n");
 const blob=new Blob([csv],{type:"text/csv"});
 const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="assinantes.csv";a.click();msg("CSV exportado.");
});
document.querySelector("#importFile").addEventListener("change",e=>{
 const file=e.target.files[0];document.querySelector("#importStatus").textContent=file?`Arquivo selecionado: ${file.name}`:"Nenhum arquivo selecionado.";msg("Arquivo importado na simulação.");
});
document.querySelectorAll("[data-op]").forEach(btn=>btn.addEventListener("click",()=>msg(`Operação "${btn.dataset.op}" executada na tabela ${currentTable}.`)));
document.querySelector("#btnBackup").addEventListener("click",()=>{showView("exportar");msg("Área de backup/exportação aberta.")});
document.querySelector("#btnReset").addEventListener("click",()=>{if(confirm("Resetar dados iniciais?")){subscribers=initialSubscribers;save();renderAll();msg("Dados resetados.")}});

function renderMetrics(){
 const total=subscribers.length;
 const revenue=subscribers.reduce((s,x)=>s+Number(x.valor),0);
 const ticket=total?revenue/total:0;
 const count=subscribers.reduce((acc,s)=>{acc[s.periodo]=(acc[s.periodo]||0)+1;return acc},{});
 const plan=Object.entries(count).sort((a,b)=>b[1]-a[1])[0]?.[0]||"-";
 document.querySelector("#metricSubscribers").textContent=total;
 document.querySelector("#metricRevenue").textContent=currency.format(revenue);
 document.querySelector("#metricTicket").textContent=currency.format(ticket);
 document.querySelector("#metricPlan").textContent=plan;
}
function renderAll(){renderTables();renderRecords();renderMetrics();renderSearchResults(subscribers)}
renderAll();
