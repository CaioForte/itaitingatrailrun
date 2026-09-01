
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBL3zWUZLpSDvR_Oomuk50_3YkfEWb_WlwhALZAO1d3BbXOvPAE64gHwZ8SiTVAyHf/exec";
const EVENTO = "TRAIL2026";

document.addEventListener("DOMContentLoaded", () => {
  const $ = id => document.getElementById(id);
  const somenteNumeros = v => String(v || "").replace(/\D/g, "");
  const formatarCPF = v => {
    const d = somenteNumeros(v).slice(0,11);
    return d.replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1-$2");
  };
  const formatarTelefone = v => {
    const d = somenteNumeros(v).slice(0,11);
    if (d.length <= 2) return d;
    if (d.length <= 6) return d.replace(/^(\d{2})(\d+)/,"($1) $2");
    if (d.length <= 10) return d.replace(/^(\d{2})(\d{4})(\d+)/,"($1) $2-$3");
    return d.replace(/^(\d{2})(\d{5})(\d+)/,"($1) $2-$3");
  };
  function cpfValido(cpf){
    const d=somenteNumeros(cpf); if(d.length!==11||/^(\d){10}$/.test(d)) return false;
    let s=0; for(let i=0;i<9;i++) s+=Number(d[i])*(10-i); let r=(s*10)%11; if(r===10)r=0; if(r!==Number(d[9]))return false;
    s=0; for(let i=0;i<10;i++) s+=Number(d[i])*(11-i); r=(s*10)%11; if(r===10)r=0; return r===Number(d[10]);
  }
  function unwrap(obj){ return obj?.dados ?? obj?.data ?? obj?.resultado ?? obj ?? {}; }
  function get(obj,...keys){ for(const k of keys){ if(obj && obj[k]!==undefined && obj[k]!==null && String(obj[k]).trim()!=="") return obj[k]; } return ""; }
  function money(v){ return Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
  function calcularIdade(data){ if(!data)return null; const n=new Date(data+"T00:00:00"),h=new Date(); if(isNaN(n))return null; let i=h.getFullYear()-n.getFullYear(); const m=h.getMonth()-n.getMonth(); if(m<0||(m===0&&h.getDate()<n.getDate()))i--; return i; }

  const menuToggle=$("menuToggle"), mainNav=$("mainNav");
  menuToggle?.addEventListener("click",()=>{const aberto=mainNav.classList.toggle("open");menuToggle.setAttribute("aria-expanded",String(aberto));});
  mainNav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>mainNav.classList.remove("open")));

  const reveal=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window){const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target);}}),{threshold:.1});reveal.forEach(e=>io.observe(e));}else reveal.forEach(e=>e.classList.add("visible"));
  document.querySelectorAll(".js-open-registration").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();$("inscricoes")?.scrollIntoView({behavior:"smooth"});setTimeout(()=>$("nome")?.focus(),500);}));

  $("cpf")?.addEventListener("input",e=>e.target.value=formatarCPF(e.target.value));
  $("consulta-cpf")?.addEventListener("input",e=>e.target.value=formatarCPF(e.target.value));
  $("telefone")?.addEventListener("input",e=>e.target.value=formatarTelefone(e.target.value));

  const estados=[['AC','Acre'],['AL','Alagoas'],['AP','Amapá'],['AM','Amazonas'],['BA','Bahia'],['CE','Ceará'],['DF','Distrito Federal'],['ES','Espírito Santo'],['GO','Goiás'],['MA','Maranhão'],['MT','Mato Grosso'],['MS','Mato Grosso do Sul'],['MG','Minas Gerais'],['PA','Pará'],['PB','Paraíba'],['PR','Paraná'],['PE','Pernambuco'],['PI','Piauí'],['RJ','Rio de Janeiro'],['RN','Rio Grande do Norte'],['RS','Rio Grande do Sul'],['RO','Rondônia'],['RR','Roraima'],['SC','Santa Catarina'],['SP','São Paulo'],['SE','Sergipe'],['TO','Tocantins']];
  if($("estado")){ estados.forEach(([uf,n])=>{const o=document.createElement("option");o.value=uf;o.textContent=`${uf} - ${n}`;$("estado").appendChild(o);}); }
$("estado")?.addEventListener("change", async e => {

  const uf = e.target.value;
  const cidade = $("cidade");

  cidade.disabled = true;

  if (!uf) {
    cidade.innerHTML =
      '<option value="">Selecione primeiro o estado</option>';
    return;
  }

  cidade.innerHTML =
    '<option value="">Carregando cidades...</option>';

  try {

    const url =
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(uf)}/municipios`;

    const resposta =
      await fetch(url, {
        method: "GET",
        cache: "no-store"
      });

    if (!resposta.ok) {
      throw new Error(
        `Erro IBGE: ${resposta.status}`
      );
    }

    const municipios =
      await resposta.json();

    cidade.innerHTML =
      '<option value="">Selecione a cidade</option>';

    municipios
      .sort((a, b) =>
        a.nome.localeCompare(
          b.nome,
          "pt-BR"
        )
      )
      .forEach(municipio => {

        const option =
          document.createElement("option");

        option.value =
          municipio.nome;

        option.textContent =
          municipio.nome;

        cidade.appendChild(option);
      });

    cidade.disabled = false;

  } catch (erro) {

    console.error(
      "Erro ao carregar cidades:",
      erro
    );

    cidade.innerHTML =
      '<option value="">Não foi possível carregar</option>';
  }

});

  let categorias=[], lote=null;
  async function carregarLote(){
    const li=$("lote"),vi=$("valor"),cs=$("categoria");
    try{const r=await fetch(
  `${GOOGLE_SCRIPT_URL}?action=publicLoteVigente&evento=${EVENTO}&_=${Date.now()}`,
  {cache:"no-store"}
);const j=await r.json();const d=unwrap(j);lote=d?.lote ?? d;const valor=Number(get(lote,"valor","preco","preço")||0);const nome=get(lote,"nome","lote");if(!nome||!valor)throw new Error("Sem lote vigente");li.value=nome;vi.value=money(valor);filtrarCategorias();}
    catch(e){lote=null;li.value="SEM LOTE VIGENTE";vi.value="R$ 0,00";if(cs){cs.disabled=true;cs.innerHTML='<option value="">INSCRIÇÕES INDISPONÍVEIS</option>';}}
  }
  async function carregarCategorias(){
    const cs=$("categoria"); if(!cs)return; cs.disabled=true;cs.innerHTML='<option value="">CARREGANDO CATEGORIAS...</option>';
    try{const r=await fetch(
  `${GOOGLE_SCRIPT_URL}?action=publicCategorias&evento=${EVENTO}&_=${Date.now()}`,
  {cache:"no-store"}
);const j=await r.json();const d=unwrap(j);categorias=Array.isArray(d?.categorias)?d.categorias:Array.isArray(d)?d:[];filtrarCategorias();}
    catch(e){cs.innerHTML='<option value="">ERRO AO CARREGAR CATEGORIAS</option>';}
  }
  function filtrarCategorias(){
    const cs=$("categoria"); if(!cs)return; const idade=calcularIdade($("dataNascimento")?.value); cs.innerHTML='<option value="">Selecione sua categoria</option>';
    categorias.filter(c=>c.ativo!==false && String(c.ativo||'SIM').toUpperCase()!=='NÃO').forEach(c=>{const nome=get(c,"nome","categoria","descricao");const maxRaw=get(c,"idadeMaxima","idade_maxima");const max=maxRaw===""?null:Number(maxRaw);if(!nome)return;if(max!==null && idade!==null && idade>max)return;const o=document.createElement("option");o.value=nome;o.textContent=nome;cs.appendChild(o);});
    cs.disabled=!(lote && cs.options.length>1);
  }
  $("dataNascimento")?.addEventListener("change",filtrarCategorias);
  carregarCategorias(); carregarLote();

  const form=$("form-inscricao"), msg=$("formSuccess"), submit=form?.querySelector(".btn-submit");
  form?.addEventListener("submit",async e=>{
    e.preventDefault(); if(!form.checkValidity()){form.reportValidity();return;}
    const cpf=somenteNumeros($("cpf").value); if(!cpfValido(cpf)){msg.className="form-success error";msg.textContent="CPF inválido. Confira o número informado.";msg.hidden=false;return;}
    if(!lote){msg.className="form-success error";msg.textContent="Não existe lote vigente para novas inscrições.";msg.hidden=false;return;}
    const old=submit.innerHTML;submit.disabled=true;submit.textContent="ENVIANDO...";msg.hidden=true;
const payload = {
  action: "publicCadastrar",
  evento: EVENTO,

  nome: $("nome").value.trim(),
  cpf: formatarCPF(cpf),
  email: $("email").value.trim(),
  telefone: $("telefone").value.trim(),
  categoria: $("categoria").value,
  dataNascimento: $("dataNascimento").value,
  estado: $("estado").value,
  cidade: $("cidade").value,
  pcd: $("pcd").value,
  equipe: $("equipe").value.trim()
};    try{
      const r=await fetch(GOOGLE_SCRIPT_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});const j=await r.json();const d=unwrap(j);
      if(j?.sucesso===false||d?.sucesso===false)throw new Error(j?.mensagem||d?.mensagem||"Não foi possível realizar a inscrição.");
      if(d?.cpf_existente===true||d?.duplicado===true){throw new Error(d?.mensagem||"Já existe uma inscrição para este CPF. Use a consulta de inscrição.");}
      const checkout=get(d,"checkout_url","checkoutUrl","url_pagamento","urlPagamento")||get(j,"checkout_url","checkoutUrl");
      msg.className="form-success";msg.innerHTML=`<strong>INSCRIÇÃO REALIZADA!</strong><br>${checkout?'Você será direcionado para o pagamento.':'Cadastro recebido com sucesso.'}`;msg.hidden=false;
      if(checkout){setTimeout(()=>window.location.href=checkout,900);} else submit.disabled=false;
    }catch(err){msg.className="form-success error";msg.textContent=err.message||"Erro ao realizar inscrição.";msg.hidden=false;submit.disabled=false;submit.innerHTML=old;}
  });

  const cf=$("form-consulta");
  function limparConsulta(){[$("consulta-erro"),$("consulta-loading"),$("consulta-resultado")].forEach(x=>{if(x)x.hidden=true});$("resultado-pagamento")?.setAttribute("hidden","");$("resultado-whatsapp")?.setAttribute("hidden","");}
  cf?.addEventListener("submit",async e=>{
    e.preventDefault(); limparConsulta();const cpf=somenteNumeros($("consulta-cpf").value);if(cpf.length!==11){$("consulta-erro").textContent="Informe um CPF válido.";$("consulta-erro").hidden=false;return;}$("consulta-loading").hidden=false;
    try{const r=await fetch(`${GOOGLE_SCRIPT_URL}?action=publicConsultar&cpf=${encodeURIComponent(cpf)}&evento=${EVENTO}&_=${Date.now()}`,{cache:"no-store"});const j=await r.json();const d=unwrap(j);$("consulta-loading").hidden=true;const encontrado=d?.encontrado!==false && (get(d,"numeroInscricao","numero_inscricao","numero")||get(d,"nome","atleta"));if(!encontrado){$("consulta-erro").innerHTML='<strong>CPF NÃO ENCONTRADO</strong><br>Não localizamos uma inscrição para este CPF.';$("consulta-erro").hidden=false;return;}
      const numero=get(d,"numeroInscricao","numero_inscricao","numero"),nome=get(d,"nome","atleta"),categoria=get(d,"categoria"),pag=get(d,"pagamento"),status=get(d,"statusInscricao","status"),checkout=get(d,"checkout_url","checkoutUrl");
      $("resultado-numero").textContent="#"+String(numero||"000").padStart(3,"0");$("resultado-nome").textContent=nome||"—";$("resultado-categoria").textContent=categoria||"—";
      const pago=String(pag).toLowerCase()==="pago";$("resultado-status-text").textContent=pago?"✓ PAGAMENTO CONFIRMADO":`${pag||status||'Pendente'}`;$("resultado-status").classList.toggle("is-paid",pago);
      const bp=$("resultado-pagamento");if(!pago&&checkout){bp.href=checkout;bp.hidden=false;}
      $("resultado-mensagem").textContent=pago?"Sua inscrição está confirmada.":"Se o pagamento estiver pendente, você pode continuar pelo botão acima.";$("consulta-resultado").hidden=false;
    }catch(err){$("consulta-loading").hidden=true;$("consulta-erro").textContent=err.message||"Não foi possível consultar a inscrição.";$("consulta-erro").hidden=false;}
  });
});
