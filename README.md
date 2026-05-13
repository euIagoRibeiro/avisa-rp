# Avisa RP

Aplicativo móvel de relatos urbanos para Ribeirão Preto, desenvolvido como Trabalho de Conclusão de Curso.

Permite que cidadãos registrem problemas urbanos (buracos, iluminação, lixo etc.) com localização, foto e categoria — e que administradores acompanhem e atualizem o status de cada relato.

---

## Como rodar

```bash
npm install
npx expo start
```

Abra o **Expo Go** no celular e escaneie o QR Code. Recomendado: Android.

---

## Credenciais de teste

| Papel | Email | Senha |
|---|---|---|
| Cidadão | cidadao@avisa.rp | 123456 |
| Admin | admin@avisa.rp | admin123 |

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Expo + React Native (SDK 54) |
| Linguagem | TypeScript (strict) |
| Estilização | NativeWind 4 (Tailwind para RN) |
| Mapa | react-native-maps + Heatmap |
| Geocodificação | Nominatim (OpenStreetMap) |
| Persistência | AsyncStorage |
| Validação | Zod 4 |
| Navegação | React Navigation (bottom tabs) |
| Câmera | expo-image-picker |
| GPS | expo-location |
| Haptics | expo-haptics |
| Ícones | @expo/vector-icons (Ionicons) |

---

## Funcionalidades

- Login com email e senha (cidadão e admin)
- Mapa interativo com GPS e geocodificação reversa
- Pins coloridos por status (vermelho / âmbar / verde)
- Camada de calor (heatmap) dos relatos
- Formulário de relato em 2 etapas com categoria, foto e opção anônima
- Lista de relatos com busca e filtro por status
- Painel admin com atualização de status e comentários
- Histórico de atualizações por relato
- Validação com Zod antes de persistir no AsyncStorage
- Skeletons de loading e toast de sucesso
- Feedback tátil (haptics) nos botões principais
- ~20 relatos mock com coordenadas reais de Ribeirão Preto

---

## Arquitetura

```
src/
├── components/        → IssueModal, Map, ReportDetailModal, SuccessToast
├── context/           → AuthContext, ReportsContext
├── screens/           → LoginScreen, ReportsScreen
├── features/
│   ├── map/           → MapTabScreen
│   └── reports/
│       └── components/ → ReportCard, EmptyState
├── hooks/             → useLocationManager, useIssueForm, useReportsFilter
├── repositories/      → ReportRepository (AsyncStorage CRUD)
├── schemas/           → reportSchema.ts (Zod)
├── constants/         → categories.ts, mockData.ts
└── types/             → index.ts
```

Sem backend real — toda a persistência é local via AsyncStorage. A arquitetura simula um ambiente multi-tenant com `tenantId: 'ribeirao-preto'`.

---

## Limitações conhecidas

- Geocodificação reversa usa Nominatim (gratuito, sem chave de API) — precisão de bairro pode variar em Ribeirão Preto conforme o cadastro do OpenStreetMap
- Heatmap funciona nativamente no Android; no iOS com Apple Maps o suporte é limitado
- Dados persistidos apenas localmente — sem sincronização entre dispositivos
