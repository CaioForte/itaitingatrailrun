// ============================================================
// CONFIGURAÇÕES DO SITE
// ============================================================
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzBL3zWUZLpSDvR_Oomuk50_3YkfEWb_WlwhALZAO1d3BbXOvPAE64gHwZ8SiTVAyHf/exec";

// Coloque aqui somente os números do WhatsApp, com DDI e DDD.
// Exemplo: 5585999999999
// Deixe vazio até definir o número oficial.
const WHATSAPP_INSCRICOES = "5585991680867";

/* ============================================================
   ITAITINGA MTB RACE - JAVASCRIPT
   Arquivo responsável por:
   - Menu mobile
   - Contagem regressiva
   - Header ao rolar
   - Animações de entrada
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     1. DATA DO EVENTO

     MUDE SOMENTE ESTA LINHA para alterar a data da prova.

     Formato:
     "ANO-MÊS-DIATHORA:MINUTO:SEGUNDO-03:00"

     -03:00 = horário de Brasília/Fortaleza.
     ========================================================== */

  const EVENT_DATE = "2026-11-01T08:00:00-03:00";


  /* ==========================================================
     2. MENU MOBILE
     ========================================================== */

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", () => {
      const opened = mainNav.classList.toggle("open");

      menuToggle.setAttribute("aria-expanded", opened ? "true" : "false");
      document.body.style.overflow = opened ? "hidden" : "";
    });

    // Fecha o menu depois que o usuário toca em um link.
    mainNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }


  /* ==========================================================
     3. HEADER MUDA AO ROLAR
     ========================================================== */

  const header = document.querySelector(".site-header");

  const updateHeader = () => {
    if (!header) return;

    header.classList.toggle("scrolled", window.scrollY > 40);
  };

  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();


  /* ==========================================================
     4. CONTAGEM REGRESSIVA
     ========================================================== */

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  const countdown = () => {

    const target = new Date(EVENT_DATE).getTime();
    const now = Date.now();

    let distance = target - now;

    // Se o evento já passou, zera o contador.
    if (distance < 0) {
      distance = 0;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  };

  countdown();
  setInterval(countdown, 1000);


  /* ==========================================================
     5. ANIMAÇÃO DOS ELEMENTOS AO ENTRAREM NA TELA
     ========================================================== */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {

          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }

        });
      },
      {
        threshold: 0.12
      }
    );

    revealElements.forEach(element => observer.observe(element));

  } else {
    // Fallback para navegadores antigos.
    revealElements.forEach(element => {
      element.classList.add("visible");
    });
  }


  /* ==========================================================
     6. ANO AUTOMÁTICO NO RODAPÉ

     Se quiser manter sempre o ano atual, podemos substituir
     o "2026" por um elemento com ID "currentYear".
     ========================================================== */


  /* ==========================================================
     7. FORMULÁRIO DE INSCRIÇÃO — GOOGLE SHEETS

     URL do Google Apps Script publicado como Aplicativo da Web.
     Para alterar futuramente, troque apenas esta constante.
     ========================================================== */

  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbzBL3zWUZLpSDvR_Oomuk50_3YkfEWb_WlwhALZAO1d3BbXOvPAE64gHwZ8SiTVAyHf/exec";

  // ==========================================================
  // VALIDAÇÃO DE CPF — SOMENTE NO NAVEGADOR
  // Não altera o Code.gs nem a validação do servidor.
  // ==========================================================

  function cpfValido(valor) {
    const cpf = String(valor || "").replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
    let resto = soma % 11;
    const digito1 = resto < 2 ? 0 : 11 - resto;
    if (digito1 !== Number(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
    resto = soma % 11;
    const digito2 = resto < 2 ? 0 : 11 - resto;

    return digito2 === Number(cpf[10]);
  }

  function formatarCPF(cpf) {
    const value = String(cpf || "").replace(/\D/g, "").slice(0, 11);
    if (value.length > 9) return value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    if (value.length > 6) return value.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    if (value.length > 3) return value.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    return value;
  }

  const registrationForm = document.getElementById("form-inscricao");
  const formSuccess = document.getElementById("formSuccess");
  const submitButton = registrationForm?.querySelector(".btn-submit");

  // ==========================================================
  // CATEGORIAS — carregadas da aba "Configurações" do painel ADM
  // ==========================================================
  const categoriaSelect = document.getElementById("categoria");

  async function carregarCategorias() {
    if (!categoriaSelect) return;

    try {
      const response = await fetch(
        GOOGLE_SHEETS_URL + "?action=publicCategorias",
        { method: "GET" }
      );

      const envelope = await response.json();
      if (!envelope.sucesso) {
        throw new Error(
          envelope.mensagem || "Não foi possível carregar as categorias."
        );
      }
      const resultado = envelope.dados || envelope;

      categoriaSelect.innerHTML =
        '<option value="">Selecione sua categoria</option>';

      (resultado.categorias || []).forEach(categoria => {
        const option = document.createElement("option");
        option.value = categoria.nome;
        option.textContent =
          categoria.nome +
          " — R$ " +
          Number(categoria.valor).toFixed(2).replace(".", ",");
        option.dataset.valor = Number(categoria.valor);

        categoriaSelect.appendChild(option);
      });

      categoriaSelect.disabled = false;

      const atualizarValorCategoria = () => {
        const valorInput = document.getElementById("valor");
        const option = categoriaSelect.options[categoriaSelect.selectedIndex];
        if (!valorInput || !option || !option.value) {
          if (valorInput) valorInput.value = "R$ 0,00";
          return;
        }
        const valor = Number(option.dataset.valor || 0);
        valorInput.value = "R$ " + valor.toFixed(2).replace(".", ",");
      };

      categoriaSelect.addEventListener("change", atualizarValorCategoria);
      atualizarValorCategoria();

    } catch (error) {
      console.error("Erro ao carregar categorias:", error);

      categoriaSelect.innerHTML =
        '<option value="">Não foi possível carregar as categorias</option>';
      categoriaSelect.disabled = true;
    }
  }

  carregarCategorias();


  document.querySelectorAll(".js-open-registration").forEach(button => {
    button.addEventListener("click", event => {
      const target = document.getElementById("form-inscricao");

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        setTimeout(() => {
          const firstField = document.getElementById("nome");
          if (firstField) firstField.focus();
        }, 650);
      }
    });
  });

  if (registrationForm) {
    registrationForm.addEventListener("submit", async event => {
      event.preventDefault();

      if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
      }

      const cpfCadastro = document.getElementById("cpf");
      if (cpfCadastro && !cpfValido(cpfCadastro.value)) {
        cpfCadastro.setCustomValidity("CPF inválido. Confira o número informado.");
        cpfCadastro.reportValidity();
        cpfCadastro.setCustomValidity("");
        return;
      }

      // Remove a mensagem anterior, caso o atleta tente novamente.
      if (formSuccess) {
        formSuccess.hidden = true;
      }

      const originalButtonText = submitButton ? submitButton.innerHTML : "ENVIAR INSCRIÇÃO →";

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = "ENVIANDO...";
      }

      // Monta os dados com os mesmos nomes esperados pelo Apps Script.
      const dados = {
        nome: document.getElementById("nome")?.value.trim() || "",
        cpf: document.getElementById("cpf")?.value.trim() || "",
        email: document.getElementById("email")?.value.trim() || "",
        telefone: document.getElementById("telefone")?.value.trim() || "",
        categoria: document.getElementById("categoria")?.value || ""
      };

      try {
        /*
         * text/plain evita o preflight CORS de application/json.
         * O Apps Script recebe o conteúdo normalmente em e.postData.contents.
         */
        const response = await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=utf-8"
          },
          body: JSON.stringify({ action: "publicCadastrar", ...dados })
        });

        const envelope = await response.json();
        const resultado = envelope.dados || envelope;
        if (!envelope.sucesso && envelope.dados === undefined) {
          throw new Error(envelope.mensagem || "Não foi possível realizar a inscrição.");
        }

        if (!resultado.sucesso) {

          // CPF já cadastrado: não usamos alert().
          // Mostramos uma resposta dentro do formulário e oferecemos
          // o mesmo caminho da consulta pública da inscrição.
          if (resultado.cpf_existente || resultado.duplicado) {

            if (formSuccess) {
              const numeroBruto = resultado.numero_inscricao ?? "";
              const numero = String(numeroBruto).padStart(3, "0");

              formSuccess.innerHTML = `
                <strong>CPF JÁ CADASTRADO</strong>
                <span>
                  Encontramos uma inscrição para este CPF.
                  Não é possível realizar uma segunda inscrição.
                </span>

                <a
                  class="btn btn-primary form-success-consultar"
                  href="#consulta-inscricao"
                  data-cpf-consulta="${dados.cpf.replace(/\D/g, "")}"
                >
                  🔎 CONSULTAR MINHA INSCRIÇÃO
                </a>

                <small>
                  Inscrição encontrada: <strong>#${numero}</strong>
                </small>
              `;

              formSuccess.hidden = false;

              const consultarBtn =
                formSuccess.querySelector(".form-success-consultar");

              if (consultarBtn) {
                consultarBtn.addEventListener("click", event => {
                  event.preventDefault();

                  if (consultaCpf) {
                    consultaCpf.value = formatarCPF(dados.cpf);
                  }

                  const secaoConsulta =
                    document.getElementById("consulta-inscricao");

                  if (secaoConsulta) {
                    secaoConsulta.scrollIntoView({
                      behavior: "smooth",
                      block: "start"
                    });
                  }

                  if (consultaCpf) {
                    setTimeout(() => consultaCpf.focus(), 650);
                  }
                });
              }

              formSuccess.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
              });
            }

            return;
          }

          throw new Error(
            resultado.mensagem ||
            "Não foi possível realizar a inscrição."
          );
        }

        // Mostra o número gerado pelo Google Sheets.
        if (formSuccess) {
          // Mantém o número sempre com 3 dígitos: 001, 002, 003...
          const numeroBruto = resultado.numero_inscricao ?? "";
          const numero = String(numeroBruto).padStart(3, "0");

          // Guarda os dados mínimos necessários para a mensagem do WhatsApp.
          const mensagemWhatsapp = [
            "Olá! Gostaria de confirmar minha inscrição no Itaitinga MTB Race XCP 2026.",
            "",
            "Inscrição: #" + numero,
            "Nome: " + dados.nome,
            "Categoria: " + dados.categoria
          ].join("\n");

          const linkWhatsapp = WHATSAPP_INSCRICOES
            ? "https://wa.me/" + WHATSAPP_INSCRICOES + "?text=" + encodeURIComponent(mensagemWhatsapp)
            : "#";

          formSuccess.innerHTML = `
            <strong>INSCRIÇÃO RECEBIDA!</strong>
            <span>Número da inscrição: <strong>#${numero}</strong></span>

            <a
              class="btn btn-whatsapp form-success-whatsapp"
              href="${linkWhatsapp}"
              target="_blank"
              rel="noopener noreferrer"
              ${WHATSAPP_INSCRICOES ? "" : "hidden"}
            >
              💬 CONFIRMAR MINHA INSCRIÇÃO PELO WHATSAPP
            </a>

            <small>
              Sua inscrição foi registrada e está aguardando confirmação.
            </small>
          `;

          formSuccess.hidden = false;
        }

        registrationForm.reset();

        if (formSuccess) {
          formSuccess.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
          });
        }

      } catch (error) {

        console.error("Erro ao enviar inscrição:", error);

        alert(
          "Não foi possível enviar a inscrição agora.\n\n" +
          "Verifique sua conexão e tente novamente."
        );

      } finally {

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      }
    });
  }

  /* Máscara + validação visual do CPF */
  const cpfInput = document.getElementById("cpf");

  if (cpfInput) {
    cpfInput.addEventListener("input", () => {
      cpfInput.value = formatarCPF(cpfInput.value);
      cpfInput.classList.remove("cpf-invalido");
    });

    cpfInput.addEventListener("blur", () => {
      if (cpfInput.value && !cpfValido(cpfInput.value)) {
        cpfInput.classList.add("cpf-invalido");
      } else {
        cpfInput.classList.remove("cpf-invalido");
      }
    });
  }

  /* Máscara simples de telefone/WhatsApp */
  const phoneInput = document.getElementById("telefone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let value = phoneInput.value.replace(/\D/g, "").slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 6) {
        value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/(\d{2})(\d{0,5})/, "($1) $2");
      }

      phoneInput.value = value;
    });
  }


  /* ==========================================================
     8. CONSULTA DE INSCRIÇÃO

     O site envia somente o CPF para o Apps Script.
     O Apps Script deve retornar apenas:
       numero_inscricao
       nome
       categoria
       status

     Não exibimos CPF, e-mail ou telefone na consulta pública.

     STATUS:
       - Confirmado -> somente mostra o status
       - Pendente   -> mostra botão de WhatsApp
       - Cancelado  -> mostra status de cancelado
     ========================================================== */

  const consultaForm = document.getElementById("form-consulta");
  const consultaCpf = document.getElementById("consulta-cpf");
  const consultaLoading = document.getElementById("consulta-loading");
  const consultaErro = document.getElementById("consulta-erro");
  const consultaResultado = document.getElementById("consulta-resultado");
  const resultadoNumero = document.getElementById("resultado-numero");
  const resultadoNome = document.getElementById("resultado-nome");
  const resultadoCategoria = document.getElementById("resultado-categoria");
  const resultadoStatus = document.getElementById("resultado-status");
  const resultadoStatusText = document.getElementById("resultado-status-text");
  const resultadoWhatsapp = document.getElementById("resultado-whatsapp");
  const resultadoMensagem = document.getElementById("resultado-mensagem");

  if (consultaCpf) {
    consultaCpf.addEventListener("input", () => {
      let value = consultaCpf.value.replace(/\D/g, "").slice(0, 11);

      if (value.length > 9) {
        value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
      } else if (value.length > 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
      } else if (value.length > 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, "$1.$2");
      }

      consultaCpf.value = value;
    });
  }

  function limparConsulta() {
    if (consultaErro) consultaErro.hidden = true;
    if (consultaResultado) consultaResultado.hidden = true;
    if (consultaLoading) consultaLoading.hidden = true;
    if (resultadoWhatsapp) resultadoWhatsapp.hidden = true;
    if (resultadoMensagem) resultadoMensagem.textContent = "";
  }

  function formatarCPF(cpf) {
    let value = String(cpf || "").replace(/\D/g, "").slice(0, 11);

    if (value.length > 9) {
      return value.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      return value.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      return value.replace(/(\d{3})(\d{0,3})/, "$1.$2");
    }

    return value;
  }

  function statusNormalizado(status) {
    return String(status || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();
  }

  function criarMensagemWhatsapp(resultado) {
    const nome = resultado.nome || "";
    const numero = resultado.numero_inscricao || "";
    const categoria = resultado.categoria || "";

    return [
      "Olá! Gostaria de confirmar minha inscrição no Itaitinga MTB Race XCP 2026.",
      "",
      "Inscrição: #" + numero,
      "Nome: " + nome,
      "Categoria: " + categoria
    ].join("\n");
  }

  if (consultaForm) {
    consultaForm.addEventListener("submit", async event => {
      event.preventDefault();

      limparConsulta();

      const cpf = (consultaCpf?.value || "").replace(/\D/g, "");

      if (cpf.length !== 11) {
        if (consultaErro) {
          consultaErro.textContent = "Informe um CPF válido para consultar.";
          consultaErro.hidden = false;
        }
        return;
      }

      if (consultaLoading) consultaLoading.hidden = false;

      try {
        /*
          GET é usado somente para consulta.
          O Apps Script precisa implementar doGet(e).
        */
        const url = GOOGLE_SCRIPT_URL + "?action=publicConsultar&cpf=" + encodeURIComponent(cpf);

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Não foi possível consultar a inscrição.");
        }

        const envelope = await response.json();
        const resultado = envelope.dados || envelope;

        if (consultaLoading) consultaLoading.hidden = true;

        if (!envelope.sucesso && envelope.dados === undefined) {
          if (consultaErro) {
            consultaErro.textContent = envelope.mensagem || "Não foi possível consultar a inscrição.";
            consultaErro.hidden = false;
          }
          return;
        }

        if (!resultado.sucesso) {
          if (consultaErro) {
            if (resultado.duplicado || resultado.cpf_existente) {
              // Mantém compatibilidade caso o Apps Script retorne duplicado.
              consultaErro.textContent = resultado.mensagem || "Este CPF já possui uma inscrição.";
            } else {
              consultaErro.innerHTML = `
                <strong>CPF NÃO ENCONTRADO</strong>
                <span>Não localizamos uma inscrição para este CPF.</span>
                <div class="consulta-not-found-actions">
                  <a href="#form-inscricao" class="btn btn-primary js-fazer-cadastro">
                    📝 FAZER CADASTRO AGORA
                  </a>
                  <a href="#" class="btn btn-whatsapp js-suporte-whatsapp" target="_blank" rel="noopener noreferrer">
                    💬 ENTRAR EM CONTATO COM O SUPORTE
                  </a>
                </div>
              `;

              const cadastroBtn = consultaErro.querySelector(".js-fazer-cadastro");
              if (cadastroBtn) {
                cadastroBtn.addEventListener("click", event => {
                  event.preventDefault();
                  const cadastroCpf = document.getElementById("cpf");
                  if (cadastroCpf) cadastroCpf.value = formatarCPF(cpf);
                  const secao = document.getElementById("inscricoes");
                  const form = document.getElementById("form-inscricao");
                  (secao || form)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setTimeout(() => cadastroCpf?.focus(), 650);
                });
              }

              const suporteBtn = consultaErro.querySelector(".js-suporte-whatsapp");
              if (suporteBtn && WHATSAPP_INSCRICOES) {
                const msg = [
                  "Olá! Não localizei minha inscrição no Itaitinga MTB Race XCP 2026.",
                  "",
                  "CPF consultado: " + formatarCPF(cpf),
                  "Gostaria de ajuda para verificar meu cadastro."
                ].join("\n");
                suporteBtn.href = "https://wa.me/" + WHATSAPP_INSCRICOES + "?text=" + encodeURIComponent(msg);
              }
            }
            consultaErro.hidden = false;
          }
          return;
        }

        resultadoNumero.textContent = "#" + String(resultado.numero_inscricao || "000").padStart(3, "0");
        resultadoNome.textContent = resultado.nome || "—";
        resultadoCategoria.textContent = resultado.categoria || "—";

        const status = statusNormalizado(resultado.status);
        const pagamento = statusNormalizado(resultado.pagamento);

        // Começa sempre escondido. Isso evita que um resultado anterior
        // deixe o botão visível quando a nova consulta estiver confirmada.
        resultadoWhatsapp.hidden = true;

        resultadoStatus.classList.remove("confirmado", "cancelado");

        if (status === "cancelado" || status === "cancelada") {
          resultadoStatus.classList.add("cancelado");
          resultadoStatusText.textContent = "INSCRIÇÃO CANCELADA";

          resultadoMensagem.textContent =
            "Entre em contato com a organização caso precise de atendimento.";

        } else if (status === "confirmado" || status === "confirmada") {
          resultadoStatus.classList.add("confirmado");
          resultadoStatusText.textContent = "✓ INSCRIÇÃO CONFIRMADA";

          resultadoMensagem.textContent =
            "Sua inscrição está confirmada. Nos vemos na largada!";

        } else if (
          pagamento === "pago" ||
          pagamento === "paga" ||
          pagamento === "recebido" ||
          pagamento === "recebida" ||
          pagamento === "confirmado" ||
          pagamento === "confirmada"
        ) {
          // Pagamento já foi identificado pela organização:
          // não há motivo para mostrar o botão de confirmação pelo WhatsApp.
          resultadoStatus.classList.add("confirmado");
          resultadoStatusText.textContent =
            "✓ PAGAMENTO CONFIRMADO";

          resultadoMensagem.textContent =
            "Seu pagamento foi confirmado. Sua inscrição está em processo de confirmação.";

        } else {
          // Somente pagamento pendente libera o contato pelo WhatsApp.
          resultadoStatusText.textContent =
            "🟡 PAGAMENTO / CONFIRMAÇÃO PENDENTE";

          resultadoMensagem.textContent =
            "Sua inscrição foi localizada, mas o pagamento ainda aguarda confirmação.";

          const whatsappNumero = WHATSAPP_INSCRICOES;

          if (whatsappNumero) {
            const mensagem = criarMensagemWhatsapp(resultado);
            resultadoWhatsapp.href =
              "https://wa.me/" +
              whatsappNumero +
              "?text=" +
              encodeURIComponent(mensagem);

            resultadoWhatsapp.hidden = false;
          }
        }

        consultaResultado.hidden = false;

      } catch (erro) {

        if (consultaLoading) consultaLoading.hidden = true;

        if (consultaErro) {
          consultaErro.textContent =
            "Não foi possível consultar agora. Tente novamente em alguns instantes.";
          consultaErro.hidden = false;
        }
      }
    });
  }

});
