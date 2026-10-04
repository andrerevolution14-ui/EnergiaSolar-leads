# Solaris — Landing Page de Alta Conversão para Energia Solar

Landing page profissional, de alta conversão e responsiva para captação e qualificação de leads de energia solar (autoconsumo residencial e comercial/industrial).

Inspirada na estética limpa, direta e equilibrada de layouts modernos em tons de azul e ardósia (hierarquia visual clara, sem palha, foco em conversão e escassez).

---

## 🚀 Funcionalidades Principais

- **1ª Dobra (Above-the-fold) Otimizada**:
  - H1 conciso e urgente: *"Poupe 40% a 70% na Fatura de Eletricidade. Instalação em 30 Dias. Aproveite já."*
  - Comutador dinâmico de público-alvo: **Para Moradias & Famílias** vs **Para Negócios & Indústria** (ajusta headline, benefícios e imagens instantaneamente).
  - CTAs duplos com contraste visual e micro-garantias de confiança.
- **Barra de Escassez e Urgência no Topo**:
  - Alerta de apoios estatais com contador de tempo real e vagas restantes ("Restam apenas 7 vagas de vistoria técnica gratuita").
- **Simulador Interativo de Poupança Solar**:
  - Slider e botões rápidos para a fatura mensal (de 80€ a 3.000€+).
  - Cálculo dinâmico de poupança mensal, poupança anual, retorno a 25 anos e toneladas de CO2 evitadas.
  - Botão de ação que transfere os valores calculados diretamente para o formulário.
- **3 Pacotes Claros de Soluções**:
  - *Residencial Essencial*, *Residencial Máxima Autonomia (+ Bateria)*, e *Comercial & Industrial*.
- **Formulário de Captação e Qualificação com Validação em 2 Etapas**:
  - Campos: Nome, Telemóvel, Tipo de Imóvel, Fatura Mensal, Interesse em Baterias e Localidade.
  - **Confirmação de Telemóvel**: Modal de verificação que apresenta o número em destaque antes do envio final, evitando números incorretos ou falsos.
  - **Efeito Confetti**: Celebração visual no envio (`canvas-confetti`) com ID de referência e timeline de próximos passos (análise de satélite, chamada técnica em 2h e proposta formal).
- **FAQ com Accordion Interativo**:
  - Respostas diretas sobre prazos (30 dias), garantias (25 anos), DGEG/licenciamento e apoios em 2026.
- **Rodapé de Confiança**:
  - Certificação técnica DGEG, linha de apoio gratuita 800 20 30 40 e conformidade com o RGPD.

---

## 🛠️ Stack Tecnológica

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Linguagem**: TypeScript
- **Estilos**: Tailwind CSS
- **Ícones**: Lucide React
- **Base de Dados**: [Neon PostgreSQL](https://neon.tech) (com fallback local seguro em `data/leads.json`)
- **Emails Transacionais**: [Resend](https://resend.com) (com templates HTML responsivos)
- **Feedback Visual**: Canvas-Confetti

---

## 📦 Como Executar

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente (Opcional para Neon & Resend)
Crie um ficheiro `.env.local` na raiz do projeto com base no `.env.example`:

```env
# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@ep-example.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Resend Email
RESEND_API_KEY="re_123456789"
NOTIFICATION_EMAIL="comercial@solaris-energia.pt"
RESEND_FROM_EMAIL="Solaris Leads <onboarding@resend.dev>"
```

> **Nota de Resiliência**: Se nenhuma variável de ambiente for configurada, o sistema funciona perfeitamente em modo de desenvolvimento, persistindo as leads automaticamente em `data/leads.json` e simulando o envio de email sem falhas.

### 3. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```

Aceda a `http://localhost:3000` no seu browser.

### 4. Compilar para Produção
```bash
npm run build
npm run start
```
