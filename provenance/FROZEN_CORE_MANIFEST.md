# FROZEN CORE MANIFEST — RC0.7.1

`RC0.7.1 ACCEPTED AS HYBRID V1 PEDAGOGICAL COMPUTATIONAL BASELINE`

`PHYSICS CORE FROZEN`

`QUANTITATIVE ICECUBE PHYSICS BASELINE = NO`

接受日期：2026-10-08 (Asia/Taipei)。這是審查與凍結記錄，沒有修改候選檔案或建立 Hybrid。

| 項目 | 凍結值 |
|---|---|
| Candidate archive | Claude_IceCube_RC0.7.1_Candidate_1.zip |
| Archive SHA-256 | 6a4f7bff25014d7cbf1dea4d16848dbaa3d2b72ddaa3365a712ea92e99188cf3 |
| Core filename | src/core.mjs |
| Core SHA-256 | b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9 |
| Core VERSION | claude-icecube-core RC0.7.1-candidate |
| Package version | 0.7.1-candidate |
| RC0.7 comparison core SHA-256 | b2cb85e16240d764c7ae60cb722ac5267c0d66d0bcf217a0504f3d46f5c5e6cb |
| Gate A / B / C | PASS / PASS / PASS |
| Physics identity | 306/306 claimed events + 3 exact inputs; complete output bitwise identical after allowed metadata mapping |
| Offline embedded core | 309/309 complete outputs identical to src; record-mode exact fixture also identical |
| Browser QA | UNKNOWN / ENVIRONMENT BLOCKED |

## Accepted API surface

`simulateEvent(EventInput)`：固定預設 physics，必須經過核心的 validateEventInput。合法 input 為：seed 是 [0,4294967295] 整數；type 為 through／starting／cascade；energy 為 [0.1,100000] TeV 有限 primitive number；vertex 是三個 dense finite primitive numbers，|x|／|z|≤800 m、depth 1200–2700 m；direction 是 dense、非零、三個 finite primitive numbers，允許任意非零尺度並由核心安全 normalize。非法輸入回 INVALID_INPUT，包括 revoked event／vertex／direction Proxy。

`validateEventInput(EventInput)`：可用於 wrapper 的輸入診斷；不能繞過 simulateEvent 內部驗證。

`sampleEventInput(type, energy, dirMode, seed)`：只對受控且已符合 contract 的 UI 參數使用，dirMode 限 up／down／any；生成的 EventInput 仍交給 simulateEvent 驗證。它本身不是任意 JavaScript 輸入的安全入口。

VERSION、CONTRACT、FIT_TIERS、FIT_GATES、DISCLAIMERS、strings、doms 等只讀查詢。wrapper 不得修改這些可變引用或 _counters；_internal、低階 physics／RNG helpers、任意 options overrides 不屬於已接受的不可信輸入 surface。不要向一般 UI 暴露 nPhase／nGroup／scatter／jitter／noise／physics RNG 參數。顯示既有 noise 的 toggle 只控制可見性。

## Scientific behavior frozen

Detector geometry、physics constants、event generation／seed streams、muon propagation／stochastic losses、photon/source generation、PE／charge sampling、cleaning、timing／scatter／jitter、ice transport、energy ledger／tolerance、cascade isotropy／identifiability、LineFit mathematics／thresholds、simulation QA，均按該 SHA-256 凍結。

Exact fixtures 40003618／7006668／7003149 的錯誤方向繼續保留；狀態只代表 FIT_RENDERABLE／ILLUSTRATIVE_LINEFIT。Cascade 保持 NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL、無 fitDirection／fitSpeed／angular QA。fitSpeed 是 regression slope；QA 不得回饋成 confidence 或 reliability gate。

## Allowed Hybrid wrappers

可 call／wrap core、visualize outputs、build adapters、add UI、cameras、Story Mode、diagnostics、social metadata。顯示變換或插值只能作用於視圖，不得改寫核心輸入、內部狀態或其 authoritative outputs。保存 exact seed＋完整 EventInput，讀數和畫面使用同一返回事件。核心警語、truth／candidate 圖例、event-dependent labels 與 QA 邊界必須保持。

## Prohibited core modifications

不得編輯該核心或更改 physics constants、detector geometry、event generation、photon timing、energy ledger、stochastic model、LineFit mathematics／gates、cascade behavior、QA feedback path。不得調參讓已知錯誤 fixture 變准，不得把 core 內部數值檢查升級為可信方向。不得用 wrapper 悄悄施加 physics overrides 或替換源項／RNG／reconstruction。

## Reopening conditions

任何 scientific code／constant／geometry／valid-input numeric output／RNG draw sequence／input-domain／physics override surface 改變，都必須重新開啓 physics-review cycle，並提交舊／新 hash、完整 diff、deterministic fixtures 與適當回歸。替換 LineFit、加入方向可信度／calibrated physics claim、改變 cascade identifiability 同樣需要重新審查。

任何 core hash drift 都先停止沿用本凍結記錄；純 documentation／wrapper／release metadata 可以另行審查，但不得覆蓋本 manifest 的核心 hash 或繞過科學變更審查。跨平台浮點差異依既有 reproducibility contract 單獨記錄，不能靜默改 physics 來追求 raw hash 相同。

RELEASE HYGIENE 的舊 fixture metadata 應在核心之外整理；修訂後的包裝／文案仍須保留本次 Gate B 語意，並獨立記錄 package provenance。凍結記錄不授予 build Hybrid 或 deploy 的新授權。
