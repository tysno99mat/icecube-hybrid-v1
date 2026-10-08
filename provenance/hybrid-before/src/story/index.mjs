export const LINEFIT_WARNING = 'LineFit 是簡化的初步重建，只作示意；可能失敗，甚至反向。內部數值／幾何檢查不證明方向正確。擬合斜率是回歸參數，不是粒子或光子的速度。';
export const CASCADE_WARNING = '本教學級聯模型的光完全等向；命中不含入射方向資訊，因此不輸出方向重建。可觀察的是示意頂點、拓撲與相對光分布；光量未校準，不能反推真實能量。';
export function interpretation(type) {
  return type === 'cascade' ? {title:'⑤ 頂點與光分布', toggle:'顯示電荷重心示意', warning:CASCADE_WARNING}
    : {title:'⑤ 方向重建示意', toggle:'顯示 LineFit 示意（可能失敗／反向）', warning:LINEFIT_WARNING};
}
export function stages(type) {
  return [
    {title:'① The Ghost Particle', subtitle:'穿過冰層的幽靈粒子', text:'微中子幾乎不與物質作用。它可以穿越大量物質，而我們只能透過極少數留下的訊號推知它的存在。', camera:'Antarctica', progress:0},
    {title:'② A Rare Interaction', subtitle:type==='through'?'帶電次級粒子進入觀測範圍':'罕見的作用，留下可見的次級粒子', text:type==='through'?'穿越事件的帶電次級粒子在偵測體外形成。畫面的黃色路徑表示模型中的次級粒子；不是微中子發光。':'微中子作用後產生帶電次級粒子。Starting 事件包含局部簇射與延伸軌跡；Cascade 事件以局部光分布為主。', camera:'Event', progress:0.08},
    {title:'③ Cherenkov Light', subtitle:'冰中的契忍可夫光', text:'帶電次級粒子可超過光在冰中的相速度，產生契忍可夫光。它沒有超過光在真空中的速度。畫面光暈是訊號的視覺示意。', camera:'Event', progress:0.42},
    {title:'④ 5,160 Optical Sensors', subtitle:'從光的時間與光量讀取事件', text:'86 條弦線上的 5,160 個 DOM 感測光訊號。逐一點亮的時間與模型電荷來自同一個事件結果；點選感測器可檢視原始數值。', camera:'Detector', progress:0.78},
    {title:interpretation(type).title, subtitle:type==='cascade'?'光分布與示意電荷重心':'真值與候選線之間的距離', text:interpretation(type).warning, camera:'Event', progress:1}
  ];
}
