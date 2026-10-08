# HYBRID V1 HANDOFF — ACCEPTED PEDAGOGICAL BASELINE

`RC0.7.1 ACCEPTED AS HYBRID V1 PEDAGOGICAL COMPUTATIONAL BASELINE`

`PHYSICS CORE FROZEN`

`QUANTITATIVE ICECUBE PHYSICS BASELINE = NO`

日期：2026-10-08 (Asia/Taipei)。本次只完成 gate check 與交接記錄；沒有建立 Hybrid，沒有部署。

## 唯一 authoritative core

候選 ZIP SHA-256：`6a4f7bff25014d7cbf1dea4d16848dbaa3d2b72ddaa3365a712ea92e99188cf3`。

`src/core.mjs` SHA-256：`b130dcf5ed8db225420bb92070206d96b5c782e9baf35fc9b300589f372882f9`。

核心版本：`claude-icecube-core RC0.7.1-candidate`。導入前核對 hash；accepted API 與凍結條件見 FROZEN_CORE_MANIFEST.md。候選包仍保持原樣，不包含本輪修補。

## 已解除的 blocker

B-INPUT-01：三種 revoked Proxy 都回 INVALID_INPUT，uncaught／physics／RNG／options reads／state mutation 均為零；六組極端有限非零方向仍可 normalize。

B-UI-01：active template、standalone/CDN、artifact body、offline 四版本全部維持候選／示意／可能失敗或反向語意；原 UI 函數的 32 cases、128 狀態執行 PASS。警語元素與圖例元素分別核對；候選線 first-visible 時同一調用顯示 warning 與 legend。Cascade 不輸出方向結果。

Gate C：RC0.7 與 RC0.7.1 的 306/306 claimed events 和另外三組 exact EventInput 完整輸出逐位元相同，僅允許 version／fitStatus 命名映射。Offline embedded core 309/309 與源核心相同。三條錯向 fixture 繼續存在，不需要 tuning。

## Hybrid 必須保留的產品語意

- Track：`⑤ 方向重建示意`；`顯示 LineFit 示意（可能失敗／反向）`。Through 明示不能直接當可信微中子來向；starting 明示簇射主導或命中幾何不利時可能嚴重失敗／反向。
- Cascade：`⑤ 頂點與光分布`；`顯示電荷重心示意`；NOT_IDENTIFIABLE_IN_PEDAGOGICAL_CASCADE_MODEL；無 LineFit direction／confidence／angular result。
- Truth：`模擬真值來向`、`模擬真值路徑`。黃色實線為模擬 truth，青色虛線＋箭頭為候選 LineFit。
- 首次候選線可見時，同時展示完整核心警語：LineFit 是簡化的初步重建，只作示意；可能失敗，甚至反向。內部數值／幾何檢查不證明方向正確。擬合斜率是回歸參數，不是粒子或光子的速度。
- FIT_RENDERABLE／ILLUSTRATIVE_LINEFIT 只表明線能畫／示意估計；QA 為 SIMULATION QA ONLY，不得轉成 valid／reliable／trusted direction。

| Exact fixture | Clean | QA angular error | Hemisphere flip |
|---|---:|---:|---|
| starting / 40003618 / 100 TeV | 29 | 123.19798699753869° | true |
| starting / 7006668 / 100 TeV | 37 | 98.00973157529418° | true |
| starting / 7003149 / 10 TeV | 30 | 122.23324681446097° | true |

完整 vertex／direction 在 TWO_BLOCKER_RESULTS.json 的 exact_fixtures。禁止只以 seed 重採樣替代 exact fixture；seed 40003618 的 sampled case 必須標 sampled_seed_40003618_not_exact_fixture 或等價文字。

## 後續工作邊界

未來獲得 Hybrid 實作授權後，可加入 UI、cameras、Story Mode、adapters、diagnostics、social metadata。只調用凍結核心，顯示輸出；不得改 constants、event generation、photon timing、energy ledger、stochastic model、LineFit mathematics、detector geometry，或暴露任意 physics options overrides。scientific change 必須先重新開啓 physics-review cycle。

RELEASE HYGIENE 尚存：主動 metadata generator／frozen regression 的 fixture_40003618 UNREPRODUCED 聲明過時；部分 sampled rows 仍靠相鄰注記而非明確 fixture-kind 標籤區分。未來只在 documentation／release metadata 整理這些文字，記錄新包裝 provenance，保持凍結核心。該 hygiene 不撤銷本次 computational acceptance。

Browser QA 為 UNKNOWN / ENVIRONMENT BLOCKED：desktop＋約 400px mobile 未成功載入；獨立 UI 函數執行不能替代 layout／WebGL／network trace。Hybrid V1 Preview 階段處理真實裝置 WebGL、警語／圖例可見性、event type switching 與 interaction QA。cross-OS／ARM per-event validation、官方 photon calibration／PPC／CLSim、better reconstruction 屬非 blocking backlog，不能據此升級定量校准聲明。

Clean replay：17 PASS、1 SKIP（缺少 alternative Node runtime），13 frozen JSON comparison PASS。作者 frozen UI_RUNTIME_CHECK 不計本次 browser evidence。來源 manifest 獨立前後 74/74；清理參考報告／截圖後 replay 的 manifest 缺檔警告已在主報告明確記錄。

`RC0.7.1 TWO-BLOCKER GPT GATE CHECK COMPLETE`
