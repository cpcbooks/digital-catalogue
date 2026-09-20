/*
=========================================================
CAMBRIDGE DIGITAL CATALOGUE — SUPABASE PILOT ADAPTER
=========================================================
Purpose:
- Read the canonical `publications` + `publication_assets` pilot from Supabase.
- Convert database rows to the existing CAMBRIDGE_CATALOGUE frontend contract.
- DO NOT replace catalogue-data.js automatically.

This file is intentionally opt-in while the pilot is validated.
=========================================================
*/
(function (global) {
  "use strict";

  const DEFAULT_SUPABASE_URL = "https://ysaxagxortpxyifyaydx.supabase.co";
  const PUBLICATIONS_PATH = "/rest/v1/publications";
  const ASSETS_PATH = "/rest/v1/publication_assets";

  function text(value) { return value === null || value === undefined ? "" : String(value).trim(); }
  function classArray(value) { if (!Array.isArray(value)) return []; return [...new Set(value.map(text).filter(Boolean))]; }
  function categoryFor(row) {
    switch (row.catalogue_section) {
      case "Early Learning": return "early-learning";
      case "School Learning": return ["Guide", "Combined Guide", "Question Bank", "Assessment Book"].includes(row.book_type) ? "exam" : "school";
      case "College and University": return "college-university";
      case "Competitive Exams": return "competitive-exams";
      default: return "";
    }
  }
  function legacyType(row) {
    const map = { "Writing Book": "Writing", "Activity Book": "Activity", "Drawing Book": "Drawing & Colouring", "Rhymes Book": "Rhymes" };
    return map[row.book_type] || row.book_type || "";
  }
  function activeAssets(assets) { return (assets || []).filter(asset => asset && asset.active !== false && text(asset.url)); }
  function firstAsset(assets, type) { return activeAssets(assets).filter(asset => asset.asset_type === type).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))[0] || null; }
  function primaryCover(assets) {
    const covers = activeAssets(assets).filter(asset => asset.asset_type === "cover");
    const primary = covers.find(asset => asset.is_primary) || covers.sort((a,b)=>(a.sort_order||0)-(b.sort_order||0))[0];
    return primary ? text(primary.url) : "";
  }
  function legacyImages(assets) {
    const front = primaryCover(assets), back = firstAsset(assets, "back_cover");
    const samples = activeAssets(assets).filter(asset => asset.asset_type === "sample_page").sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).map(asset=>text(asset.url));
    return { front, back: back ? text(back.url) : "", samples };
  }
  function toLegacyBook(row, assets) {
    return {
      id:text(row.id), productId:text(row.id), sku:text(row.sku), isbn:text(row.isbn), series:text(row.series), family:text(row.series), title:text(row.title),
      class:classArray(row.class_stage), subject:text(row.subject), medium:text(row.medium), languagePosition:text(row.language_position), bookType:text(row.book_type), type:legacyType(row), category:categoryFor(row),
      mrp:row.mrp===null||row.mrp===undefined?null:Number(row.mrp), cover:primaryCover(assets), images:legacyImages(assets),
      author:text(row.author), coAuthor:text(row.co_author), pages:row.pages===null||row.pages===undefined?null:Number(row.pages),
      lengthCm:row.length_cm===null||row.length_cm===undefined?null:Number(row.length_cm), breadthCm:row.breadth_cm===null||row.breadth_cm===undefined?null:Number(row.breadth_cm),
      thicknessCm:row.thickness_cm===null||row.thickness_cm===undefined?null:Number(row.thickness_cm), weightKg:row.weight_kg===null||row.weight_kg===undefined?null:Number(row.weight_kg),
      active:row.status==="Active", catalogueSection:text(row.catalogue_section), source:"supabase"
    };
  }
  async function request(path, options) {
    const config=options||{},baseUrl=text(config.supabaseUrl||DEFAULT_SUPABASE_URL).replace(/\/$/,""),anonKey=text(config.anonKey);
    if(!anonKey)throw new Error("Supabase catalogue pilot requires an anon key.");
    const response=await fetch(baseUrl+path,{method:"GET",headers:{apikey:anonKey,Authorization:`Bearer ${anonKey}`,Accept:"application/json"}});
    if(!response.ok)throw new Error(`Catalogue request failed (${response.status}).`);
    return response.json();
  }
  async function load(options) {
    const [publications,assets]=await Promise.all([
      request(`${PUBLICATIONS_PATH}?select=*&status=eq.Active&order=catalogue_section.asc,title.asc`,options),
      request(`${ASSETS_PATH}?select=*&active=eq.true&order=publication_id.asc,sort_order.asc`,options)
    ]);
    const byPublication=new Map();
    (assets||[]).forEach(asset=>{const key=text(asset.publication_id);if(!byPublication.has(key))byPublication.set(key,[]);byPublication.get(key).push(asset)});
    return (publications||[]).map(row=>toLegacyBook(row,byPublication.get(text(row.id))||[]));
  }
  async function compareWithStatic(options) {
    const supabaseBooks=await load(options),staticBooks=Array.isArray(global.CAMBRIDGE_CATALOGUE)?global.CAMBRIDGE_CATALOGUE:[];
    const summarize=books=>({total:books.length,earlyLearning:books.filter(b=>b.category==="early-learning").length,school:books.filter(b=>b.category==="school").length,exam:books.filter(b=>b.category==="exam").length,collegeUniversity:books.filter(b=>b.category==="college-university").length,competitiveExams:books.filter(b=>b.category==="competitive-exams").length});
    return {static:summarize(staticBooks),supabase:summarize(supabaseBooks),supabaseBooks};
  }
  async function installPilot(options){const books=await load(options);global.CAMBRIDGE_CATALOGUE_SUPABASE_PILOT=books;return books}
  global.CambridgeSupabaseCatalogue=Object.freeze({load,installPilot,compareWithStatic,toLegacyBook,categoryFor});
})(window);
