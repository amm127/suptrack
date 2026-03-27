import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../lib/supabase'
import Auth from './Auth'
// ── Date helpers — no hardcoded dates in runtime logic ─────────────────────
const TODAY = () => new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const TODAY_MONTH = () => new Date().toLocaleDateString("en-US",{month:"long",year:"numeric"});


// ── Themes ─────────────────────────────────────────────────────────────────
const THEMES = {
  // ── SupTrack 🌈 muted rainbow — dusty periwinkle, peach, gold, mauve, sage ─
  suptrack: { name:"SupTrack",     swatch:"#9AB0CC",
    bg:"#FAF9F8", surface:"#FFFFFF", surfaceAlt:"#F4F2F0", border:"#E2DDD8", borderLight:"#EDE9E4",
    text:"#1E1C1A", muted:"#7A7268", faint:"#C0B8B0",
    accent:"#7B9FD4", accentLight:"#EEF2FA", accentMid:"#C0CCEA", accentText:"#3A5A8A",
    gradient:"linear-gradient(135deg,#7B9FD4,#88B8A0,#A088C8)",
    gradientSubtle:"linear-gradient(135deg,#F0F4FA,#F0F8F4,#F5F0FA)",
    gradientMid:"linear-gradient(135deg,#BACCE8,#B0D8C4,#C8B4E8)",
    isGradient:true,
    shades:["#EEF2FA","#C0CCEA","#7B9FD4","#88B8A0","#A088C8","#6A5A90"],
    dark:{ bg:"#141210", surface:"#1E1C18", surfaceAlt:"#282420", border:"#3C3830", borderLight:"#302C28", text:"#F0EAE0", muted:"#A09888", faint:"#3A3630", accent:"#9AB8D8", accentLight:"#1C1A18", accentMid:"#303028", accentText:"#C0D4EC",
      gradient:"linear-gradient(135deg,#7B9FD4,#88B8A0,#A088C8)" }},


  sunset:   { name:"Sunset",      swatch:"#C4607A",
    bg:"#FDF5F8", surface:"#FFFFFF", surfaceAlt:"#FAE8F0", border:"#F0C8D8", borderLight:"#F7DCE8",
    text:"#2A1020", muted:"#8A5068", faint:"#D4A0B8",
    accent:"#C4607A", accentLight:"#FCE8F0", accentMid:"#E8A8BF", accentText:"#8C2545",
    shades:["#FCE8F0","#F0B8D0","#D880A0","#C4607A","#8C2545","#5C0A25"],
    dark:{ bg:"#200A14", surface:"#2C1020", surfaceAlt:"#38182C", border:"#5A2840", borderLight:"#481E34", text:"#F5E0EA", muted:"#C07898", faint:"#4A1E30", accent:"#E07898", accentLight:"#2C1020", accentMid:"#5A2840", accentText:"#F0A8C4" }},

  // ── Lavender Fields — soft purple, calm, dreamy ─────────────────────────
  lavender: { name:"Lavender Fields", swatch:"#8B6BB1",
    bg:"#F8F5FD", surface:"#FFFFFF", surfaceAlt:"#F0EBF9", border:"#D8CEEF", borderLight:"#E8E0F7",
    text:"#1E1530", muted:"#6A5890", faint:"#B8A8D8",
    accent:"#8B6BB1", accentLight:"#F0EBF9", accentMid:"#C8B4E8", accentText:"#5A3A8A",
    shades:["#F0EBF9","#C8B4E8","#A888CC","#8B6BB1","#5A3A8A","#352060"],
    dark:{ bg:"#150E24", surface:"#1E1630", surfaceAlt:"#28203E", border:"#4A3870", borderLight:"#3A2C58", text:"#EAE0F8", muted:"#A890D0", faint:"#3A2858", accent:"#A880D0", accentLight:"#201830", accentMid:"#4A3268", accentText:"#C8A8E8" }},

  // ── Peach Blossom — warm peachy pink, soft and sweet ───────────────────
  peach:    { name:"Peach Blossom", swatch:"#E8886A",
    bg:"#FDF8F5", surface:"#FFFFFF", surfaceAlt:"#FDF0E8", border:"#F0D4BC", borderLight:"#F7E4D0",
    text:"#2A1808", muted:"#8A6040", faint:"#D4A880",
    accent:"#E8886A", accentLight:"#FDF0E8", accentMid:"#F0C0A0", accentText:"#A84820",
    shades:["#FDF0E8","#F0C0A0","#EC9C78","#E8886A","#A84820","#6C2808"],
    dark:{ bg:"#201208", surface:"#2A1A10", surfaceAlt:"#36221A", border:"#5A3828", borderLight:"#4A2E20", text:"#F5E8DC", muted:"#C89070", faint:"#4A2E20", accent:"#F0A080", accentLight:"#2A1810", accentMid:"#5A3020", accentText:"#F8C0A0" }},

  // ── Morning Dew — fresh sage green, calm and grounding ──────────────────
  sage:     { name:"Morning Dew",  swatch:"#5B7B5E",
    bg:"#FAF8F3", surface:"#FFFFFF", surfaceAlt:"#F3F0E8", border:"#E2DDD3", borderLight:"#EDE9E0",
    text:"#2C2A25", muted:"#857F72", faint:"#C0B9AC",
    accent:"#5B7B5E", accentLight:"#EEF4EE", accentMid:"#C4D9C6", accentText:"#3A5C3D",
    shades:["#EEF4EE","#C4D9C6","#8AAF8D","#5B7B5E","#3A5C3D","#254030"],
    dark:{ bg:"#1A1F1A", surface:"#222820", surfaceAlt:"#2A3028", border:"#364034", borderLight:"#2E3A2C", text:"#E8EDE6", muted:"#8FAE8A", faint:"#3A4A38", accent:"#7AB87E", accentLight:"#1E2E1E", accentMid:"#2E4E30", accentText:"#A8D8AC" }},

  // ── Ocean Mist — soft airy blue, peaceful and open ──────────────────────
  slate:    { name:"Ocean Mist",   swatch:"#6A9BB8",
    bg:"#F5F8FC", surface:"#FFFFFF", surfaceAlt:"#EBF2F8", border:"#C8DCF0", borderLight:"#D8EAF7",
    text:"#141E2C", muted:"#5A7898", faint:"#A8C4DC",
    accent:"#6A9BB8", accentLight:"#EBF2F8", accentMid:"#B0D0E8", accentText:"#2A5878",
    shades:["#EBF2F8","#B0D0E8","#80B4D4","#6A9BB8","#2A5878","#103050"],
    dark:{ bg:"#0C1620", surface:"#141E2C", surfaceAlt:"#1C2A3A", border:"#2A3E54", borderLight:"#223048", text:"#D8ECF8", muted:"#80B0CC", faint:"#1E3048", accent:"#6AB0D4", accentLight:"#141E30", accentMid:"#1E3850", accentText:"#98CCE8" }},

  // ── Rose Garden — dusty pink, romantic and soft ──────────────────────────
  rose:     { name:"Rose Garden",  swatch:"#C47A8A",
    bg:"#FDF6F7", surface:"#FFFFFF", surfaceAlt:"#FAECEE", border:"#F0D0D6", borderLight:"#F7DFE3",
    text:"#2A1820", muted:"#906870", faint:"#D8A8B0",
    accent:"#C47A8A", accentLight:"#FAE8EC", accentMid:"#E8B0BC", accentText:"#8C3848",
    shades:["#FAE8EC","#E8B0BC","#D48898","#C47A8A","#8C3848","#5C1828"],
    dark:{ bg:"#1E1018", surface:"#281820", surfaceAlt:"#34202C", border:"#5A3040", borderLight:"#482838", text:"#F5E0E5", muted:"#C08090", faint:"#4A2030", accent:"#E090A0", accentLight:"#281020", accentMid:"#582838", accentText:"#F0B0C0" }},

  // ── Rainy Day — muted blue-gray, cozy and introspective ─────────────────
  gloomy:   { name:"Rainy Day",    swatch:"#7888A8",
    bg:"#F4F5F8", surface:"#FFFFFF", surfaceAlt:"#EBEEf5", border:"#CCD4E4", borderLight:"#DAE0EE",
    text:"#1C2030", muted:"#607088", faint:"#B0B8CC",
    accent:"#7888A8", accentLight:"#EBEEf5", accentMid:"#C0CCDF", accentText:"#384868",
    shades:["#EBEEf5","#C0CCDF","#9AACC4","#7888A8","#384868","#1C2840"],
    dark:{ bg:"#10141E", surface:"#181C28", surfaceAlt:"#202434", border:"#303848", borderLight:"#283040", text:"#D8DCF0", muted:"#8090B0", faint:"#283040", accent:"#8898B8", accentLight:"#181C2C", accentMid:"#2C3850", accentText:"#A8B8D4" }},

  // ── Midnight — dark and warm, candlelight glow ──────────────────────────
  midnight: { name:"Midnight",     swatch:"#C49A5C",
    bg:"#1A1814", surface:"#242018", surfaceAlt:"#2C2820", border:"#3A342C", borderLight:"#302A22",
    text:"#EDE8DF", muted:"#8A8278", faint:"#4A4540",
    accent:"#C49A5C", accentLight:"#2C2518", accentMid:"#5A4828", accentText:"#E8C878",
    shades:["#2C2518","#5A4828","#96783C","#C49A5C","#E8C878","#F8E0A0"],
    dark:{ bg:"#0E0C0A", surface:"#161410", surfaceAlt:"#1E1A14", border:"#2C2820", borderLight:"#242018", text:"#F0EAE0", muted:"#907E6A", faint:"#3A3428", accent:"#D4AA6C", accentLight:"#201A10", accentMid:"#4A3C20", accentText:"#F0CC88" }},

  // ── Forest Walk — deep mossy green, earthy and calm ─────────────────────
  forest:   { name:"Forest Walk",  swatch:"#2D5A3D",
    bg:"#F4F8F5", surface:"#FFFFFF", surfaceAlt:"#EAF2EC", border:"#C8DDD0", borderLight:"#D8EAE0",
    text:"#1A2C20", muted:"#5A7A65", faint:"#A8C4B0",
    accent:"#2D5A3D", accentLight:"#E4F2E8", accentMid:"#A4C8B0", accentText:"#1A4028",
    shades:["#E4F2E8","#A4C8B0","#60986C","#2D5A3D","#1A4028","#0C2816"],
    dark:{ bg:"#101A12", surface:"#162018", surfaceAlt:"#1C2A1E", border:"#264030", borderLight:"#1E3226", text:"#D8EEE0", muted:"#6AAA7A", faint:"#1E3228", accent:"#5A9A6C", accentLight:"#142018", accentMid:"#204A2C", accentText:"#88C898" }},

  // ── Lagoon — deep teal, tropical and refreshing ──────────────────────────
  wild:     { name:"Lagoon",       swatch:"#1A8A8A",
    bg:"#F5FAFA", surface:"#FFFFFF", surfaceAlt:"#E8F5F5", border:"#B8DEDE", borderLight:"#D0ECEC",
    text:"#0C1C20", muted:"#3A6870", faint:"#88C8C8",
    accent:"#1A8A8A", accentLight:"#E0F5F5", accentMid:"#88D0D0", accentText:"#085858",
    shades:["#E0F5F5","#88D0D0","#389898","#1A8A8A","#085858","#023838"],
    dark:{ bg:"#081818", surface:"#101E1E", surfaceAlt:"#182828", border:"#1E4040", borderLight:"#183434", text:"#CCF0F0", muted:"#48A8A8", faint:"#183838", accent:"#30B0B0", accentLight:"#102020", accentMid:"#185050", accentText:"#68D0D0" }},

  // ── Electric ⚡ maximum vibrancy — hot pink, electric blue, neon green ────
  electric: { name:"Electric",     swatch:"#E8006A",
    bg:"#FFF0F8", surface:"#FFFFFF", surfaceAlt:"#FFE0F4", border:"#FFB0D8", borderLight:"#FFD0EC",
    text:"#1A0020", muted:"#880050", faint:"#FF80C0",
    accent:"#E8006A", accentLight:"#FFE0F4", accentMid:"#FF80C0", accentText:"#800030",
    gradient:"linear-gradient(135deg,#E8006A,#0080FF,#00E080)",
    gradientSubtle:"linear-gradient(135deg,#FFE0F4,#E0F0FF,#E0FFF4)",
    gradientMid:"linear-gradient(135deg,#FF80B8,#80C0FF,#80FFD0)",
    isGradient:true,
    shades:["#FFE0F4","#FF80C0","#E8006A","#0080FF","#00E080","#008040"],
    dark:{ bg:"#140020", surface:"#200030", surfaceAlt:"#2C0040", border:"#600080", borderLight:"#480060", text:"#FFCCF0", muted:"#FF60C0", faint:"#400060", accent:"#FF2090", accentLight:"#200030", accentMid:"#600080", accentText:"#FF80D0",
      gradient:"linear-gradient(135deg,#FF2090,#00A0FF,#00FF90)" }},


  mono:     { name:"Black & White", swatch:"#1A1A1A",
    bg:"#F8F8F8", surface:"#FFFFFF", surfaceAlt:"#EFEFEF", border:"#CCCCCC", borderLight:"#E4E4E4",
    text:"#111111", muted:"#555555", faint:"#AAAAAA",
    accent:"#111111", accentLight:"#EBEBEB", accentMid:"#BBBBBB", accentText:"#111111",
    shades:["#EBEBEB","#BBBBBB","#888888","#555555","#222222","#000000"],
    dark:{ bg:"#000000", surface:"#111111", surfaceAlt:"#1C1C1C", border:"#333333", borderLight:"#282828", text:"#FFFFFF", muted:"#AAAAAA", faint:"#444444", accent:"#FFFFFF", accentLight:"#1C1C1C", accentMid:"#3A3A3A", accentText:"#FFFFFF" }},

  // ── Rainbow ──────────────────────────────────────────────────────────────
  rainbow:  { name:"Rainbow",       swatch:"#9B6FD4",
    bg:"#FAFAFA", surface:"#FFFFFF", surfaceAlt:"#F5F0FF",
    border:"#E0D0FF", borderLight:"#EDE8FF",
    text:"#1A0A2E", muted:"#7A60A0", faint:"#C4B0E8",
    accent:"#9B6FD4", accentLight:"#F3EEFB", accentMid:"#D0B4EC", accentText:"#5A3A90",
    isRainbow: true,
    dark:{ bg:"#0A0014", surface:"#130024", surfaceAlt:"#1E0038", border:"#3D006A", borderLight:"#2A0050", text:"#F5EAFF", muted:"#C084FC", faint:"#4B1D7A", accent:"#A855F7", accentLight:"#200040", accentMid:"#6B21A8", accentText:"#E879F9" }},
};

// ── Fonts ──────────────────────────────────────────────────────────────────
const FONTS = {
  fraunces:    { name:"Fraunces + DM Sans",        display:"'Fraunces', Georgia, serif",               body:"'DM Sans', system-ui, sans-serif",              mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400;500&display=swap" },
  playfair:    { name:"Playfair + Lato",            display:"'Playfair Display', Georgia, serif",       body:"'Lato', system-ui, sans-serif",                 mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;700&family=Lato:wght@300;400;500&family=DM+Mono&display=swap" },
  space_lora:  { name:"Space Grotesk + Lora",       display:"'Space Grotesk', system-ui, sans-serif",  body:"'Lora', Georgia, serif",                        mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Lora:wght@400;500&family=DM+Mono&display=swap" },
  sora:        { name:"Sora + Nunito",              display:"'Sora', system-ui, sans-serif",            body:"'Nunito', system-ui, sans-serif",               mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Nunito:wght@300;400;500&family=DM+Mono&display=swap" },
  crimson:     { name:"Crimson Pro + DM Sans",      display:"'Crimson Pro', Georgia, serif",            body:"'DM Sans', system-ui, sans-serif",              mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@400;500&family=DM+Mono&display=swap" },
  josefin:     { name:"Josefin Sans + Mulish",      display:"'Josefin Sans', system-ui, sans-serif",   body:"'Mulish', system-ui, sans-serif",               mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;600&family=Mulish:wght@300;400;500&family=DM+Mono&display=swap" },
  inter:       { name:"Inter — Clean & Modern",     display:"'Inter', system-ui, sans-serif",           body:"'Inter', system-ui, sans-serif",                mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" },
  mono_pair:   { name:"Mono — Technical",           display:"'DM Mono', monospace",                    body:"'Inter', system-ui, sans-serif",                mono:"'DM Mono', monospace", url:"https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" },
};

// ── Static semantic colors ─────────────────────────────────────────────────
const S = { amber:"#B87D2A",amberLight:"#FAF2E4", red:"#A83A3A",redLight:"#FAE8E8", purple:"#6B3FA0",purpleLight:"#F2EDFB", blue:"#2A4E8A",blueLight:"#EAF0FB", teal:"#1A7A8A",tealLight:"#E5F3F6", coral:"#A84B2F",coralLight:"#FAEDE8", green:"#2E7A4E",greenLight:"#E8F5EE" };

// ── Flag categories ────────────────────────────────────────────────────────
const FLAG_CATS = [
  { id:"documentation", label:"Documentation",  color:"#B87D2A", bg:"#FAF2E4" },
  { id:"clinical",      label:"Clinical",       color:"#A83A3A", bg:"#FAE8E8" },
  { id:"payment",       label:"Payment",        color:"#A84B2F", bg:"#FAEDE8" },
  { id:"hours",         label:"Hours",          color:"#6B3FA0", bg:"#F2EDFB" },
  { id:"communication", label:"Communication",  color:"#2A4E8A", bg:"#EAF0FB" },
  { id:"general",       label:"General",        color:"#5A5450", bg:"#F0ECE4"  },
];

// ── Permission defs ────────────────────────────────────────────────────────
const PERM_DEFS = [
  { id:"viewNotes",    label:"View session notes",  group:"Notes" },
  { id:"editNotes",    label:"Add session notes",   group:"Notes" },
  { id:"viewDocs",     label:"View documents",      group:"Documents" },
  { id:"uploadDocs",   label:"Upload documents",    group:"Documents" },
  { id:"viewPayments", label:"View payment info",   group:"Payments" },
  { id:"viewHours",    label:"View hours tracker",  group:"Hours" },
];
const DEFAULT_PERMS = { viewNotes:true, editNotes:false, viewDocs:true, uploadDocs:false, viewPayments:false, viewHours:true };

const INITIAL_COLLEAGUES = [
  { id:"c1", name:"Dr. Renee Faulkner", initials:"RF", email:"rfaulkner@cbhc.org",        color:"#7A3FA0", colorLight:"#F0E8FA" },
  { id:"c2", name:"Marcus Webb",         initials:"MW", email:"mwebb@questcounseling.org", color:"#1A6A7A", colorLight:"#E3F3F6" },
  { id:"c3", name:"Tanya Osei",          initials:"TO", email:"tosei@cbhc.org",            color:"#7A4A20", colorLight:"#F5EDE0" },
];

// ── Seed data ──────────────────────────────────────────────────────────────
const INITIAL_LISTS  = [
  { id:"l1", name:"CBHC",             color:S.purple, colorLight:S.purpleLight },
  { id:"l2", name:"Private Practice", color:S.teal,   colorLight:S.tealLight   },
];
const INITIAL_GROUPS = [
  { id:"g1", name:"Primary Group",   color:"#5B7B5E", colorLight:"#EEF4EE", paymentPerIntern:60, split:50, sharedWith:[{ colleagueId:"c1", perms:{ viewNotes:true,editNotes:true,viewDocs:true,uploadDocs:false,viewPayments:false,viewHours:true } }],
    sessions:[
      { date:"Mar 14, 2026", duration:"90 min", attendees:[1,2], author:"Alyson",       notes:"Ethics case presentation — dual relationship scenario. Discussed reporting obligations." },
      { date:"Feb 28, 2026", duration:"90 min", attendees:[1,2], author:"Dr. Faulkner", notes:"Trauma-informed care framework. Group practice of grounding. Self-care discussion." },
    ]},
  { id:"g2", name:"Secondary Group", color:S.blue,   colorLight:S.blueLight,  sharedWith:[],
    sessions:[
      { date:"Mar 18, 2026", duration:"90 min", attendees:[3], author:"Alyson", notes:"DBT skills application. Chain analysis as a supervision tool." },
    ]},
];

const mkHours = (periods) => periods; // helper for clarity

const INITIAL_INTERNS = [
  { id:1, name:"Marissa Holloway", preferredName:"", initials:"MH", pronouns:"she/her", dob:"2001-03-22",
    supervisorRole:"primary", internType:"counseling", discipline:"counseling", credential:"LPC-Intern", credentialBody:"CACREP", licenseGoal:"LPC", startDate:"Aug 2023", status:"active", photo:null,
    groupIds:["g1"], listIds:["l2"], proBono:false, paymentStatus:"current",
    hoursTotal:3000, hoursCompleted:1842, individualHours:920, groupHours:922,
    hourLog: [
      { id:"h1", category:"individual_supervision", type:"direct", hours:56, label:"Individual Supervision" },
      { id:"h2", category:"group_supervision",      type:"direct", hours:28, label:"Group Supervision" },
    ],
    internHourLog: [
      { id:"s1", category:"primary_supervision_received",   type:"direct",   hours:56,  label:"Individual Supervision — Primary" },
      { id:"s2", category:"secondary_supervision_received", type:"direct",   hours:0,   label:"Individual Supervision — Secondary" },
      { id:"s3", category:"group_supervision_received",     type:"direct",   hours:28,  label:"Group Supervision Received" },
      { id:"i1", category:"mft_clients",         type:"direct",   hours:920, label:"Therapy with Clients (Individual)" },
      { id:"i2", category:"group_therapy",        type:"direct",   hours:180, label:"Group Therapy (with Clients)" },
      { id:"i3", category:"personal_therapy",     type:"indirect", hours:40,  label:"Personal Therapy" },
      { id:"i4", category:"documented_teaching",  type:"indirect", hours:20,  label:"Documented Teaching / Workshops" },
      { id:"i5", category:"additional_training",  type:"indirect", hours:32,  label:"Additional Training / Graduate Work" },
    ],
    customHourCategories: [],
    flags:[
      { id:"f1", category:"documentation", note:"Consistent lateness turning in session notes — follow up at next supervision.", date:"Mar 7, 2026", resolved:false },
    ],
    supervisorHoursLog: mkHours([
      { period:"Jan–Jun 2026", individual:10, group:6 },
      { period:"Jul–Dec 2025", individual:24, group:12 },
      { period:"Jan–Jun 2025", individual:22, group:12 },
    ]),
    internReportedHours: mkHours([
      { period:"Jan–Jun 2026", individual:12, group:6 },
      { period:"Jul–Dec 2025", individual:24, group:12 },
      { period:"Jan–Jun 2025", individual:22, group:12 },
    ]),
    sharedWith:[{ colleagueId:"c1", perms:{ viewNotes:true,editNotes:true,viewDocs:true,uploadDocs:true,viewPayments:false,viewHours:true } }],
    sessions:[
      { date:"Mar 14, 2026", type:"Individual", duration:"60 min", author:"Alyson",       notes:"Countertransference with adult trauma client. Safety planning protocol. MI strategies." },
      { date:"Mar 7, 2026",  type:"Individual", duration:"60 min", author:"Dr. Faulkner", notes:"Case consultation — treatment plan for Trauma/PTSD client. Phase 2 readiness." },
    ],
    cases:[
      { id:"C-0041", presenting:"Generalized Anxiety",          sessions:12, lastStaffed:"Mar 14", notes:"Progressing on worry toleration. Considering CBT protocol." },
      { id:"C-0055", presenting:"Trauma / PTSD",                sessions:8,  lastStaffed:"Mar 7",  notes:"Phase 1 stabilization. Safety plan reviewed." },
      { id:"C-0062", presenting:"Depression, Co-occurring SUD", sessions:5,  lastStaffed:"Mar 7",  notes:"MI focus. Exploring readiness for SUD tx." },
    ],
    documents:[
      { name:"Supervision Agreement",          date:"Aug 10, 2023", type:"Contract",  uploadedBy:"supervisor" },
      { name:"LPC-Intern License",             date:"Aug 10, 2023", type:"License",   uploadedBy:"intern" },
      { name:"Liability Insurance Certificate",date:"Jan 3, 2026",  type:"Insurance", uploadedBy:"intern" },
      { name:"CACREP Training Plan",           date:"Aug 10, 2023", type:"Plan",      uploadedBy:"supervisor" },
    ],
    payments:[
      { month:"March 2026",    amount:200, status:"paid",    date:"Mar 1",  quarter:"Q1 2026" },
      { month:"February 2026", amount:200, status:"paid",    date:"Feb 1",  quarter:"Q1 2026" },
      { month:"January 2026",  amount:200, status:"paid",    date:"Jan 3",  quarter:"Q1 2026" },
      { month:"December 2025", amount:200, status:"paid",    date:"Dec 2",  quarter:"Q4 2025" },
    ],
  },
  { id:2, name:"Devon Castellano", preferredName:"Dev", initials:"DC", pronouns:"they/them", dob:"1998-07-14",
    supervisorRole:"secondary", internType:"student", discipline:"counseling", credential:"Practicum Student", credentialBody:"University", university:"University of Nevada, Reno", licenseGoal:"LPC", startDate:"Jan 2024", status:"active", photo:null,
    groupIds:["g1"], listIds:["l1"], proBono:false, paymentStatus:"overdue",
    hoursTotal:3000, hoursCompleted:1104, individualHours:540, groupHours:564,
    hourLog: [
      { id:"h1", category:"individual_supervision", type:"direct", hours:32, label:"Individual Supervision" },
      { id:"h2", category:"group_supervision",      type:"direct", hours:18, label:"Group Supervision" },
    ],
    internHourLog: [
      { id:"s1", category:"primary_supervision_received",   type:"direct",   hours:0,   label:"Individual Supervision — Primary" },
      { id:"s2", category:"secondary_supervision_received", type:"direct",   hours:32,  label:"Individual Supervision — Secondary" },
      { id:"s3", category:"group_supervision_received",     type:"direct",   hours:18,  label:"Group Supervision Received" },
      { id:"i1", category:"mft_clients",         type:"direct",   hours:540, label:"Therapy with Clients (Individual)" },
      { id:"i2", category:"group_therapy",        type:"direct",   hours:120, label:"Group Therapy (with Clients)" },
      { id:"i3", category:"personal_therapy",     type:"indirect", hours:20,  label:"Personal Therapy" },
      { id:"i4", category:"documented_teaching",  type:"indirect", hours:8,   label:"Documented Teaching / Workshops" },
      { id:"i5", category:"additional_training",  type:"indirect", hours:12,  label:"Additional Training / Graduate Work" },
    ],
    customHourCategories: [],
    flags:[
      { id:"f2", category:"payment",  note:"Two months overdue. Send reminder and discuss at next session.", date:"Mar 15, 2026", resolved:false },
      { id:"f3", category:"clinical", note:"Expressed uncertainty about adolescent case conceptualization — revisit diagnostic framework.", date:"Feb 20, 2026", resolved:false },
    ],
    supervisorHoursLog: mkHours([
      { period:"Jan–Jun 2026", individual:8, group:4 },
      { period:"Jul–Dec 2025", individual:18, group:8 },
    ]),
    internReportedHours: mkHours([
      { period:"Jan–Jun 2026", individual:8, group:4 },
      { period:"Jul–Dec 2025", individual:20, group:8 },
    ]),
    sharedWith:[{ colleagueId:"c2", perms:{ viewNotes:true,editNotes:false,viewDocs:true,uploadDocs:false,viewPayments:false,viewHours:false } }],
    sessions:[
      { date:"Mar 13, 2026", type:"Individual", duration:"60 min", author:"Alyson", notes:"New intake staffed — adolescent with school refusal and family conflict." },
    ],
    cases:[
      { id:"C-0071", presenting:"School Refusal / Family", sessions:3, lastStaffed:"Mar 13", notes:"Family systems approach planned." },
      { id:"C-0044", presenting:"Adolescent Depression",   sessions:9, lastStaffed:"Mar 6",  notes:"Good rapport. ACT-based interventions." },
    ],
    documents:[
      { name:"Supervision Agreement",          date:"Jan 15, 2024", type:"Contract",  uploadedBy:"supervisor" },
      { name:"University Practicum Form",       date:"Jan 15, 2024", type:"Plan",      uploadedBy:"intern" },
      { name:"Liability Insurance Certificate", date:"Jan 8, 2026",  type:"Insurance", uploadedBy:"intern" },
    ],
    payments:[
      { month:"March 2026",    amount:200, status:"overdue", date:"—",     quarter:"Q1 2026" },
      { month:"February 2026", amount:200, status:"paid",    date:"Feb 3", quarter:"Q1 2026" },
      { month:"January 2026",  amount:200, status:"paid",    date:"Jan 5", quarter:"Q1 2026" },
    ],
  },
  { id:3, name:"Priya Nandakumar", preferredName:"", initials:"PN", pronouns:"she/her", dob:"1995-11-03",
    supervisorRole:"primary", internType:"social_work", discipline:"social_work", credential:"LMSW", credentialBody:"NASW", licenseGoal:"LCSW", startDate:"Sep 2023", status:"active", photo:null,
    groupIds:["g2"], listIds:["l1","l2"], proBono:true, paymentStatus:"current",
    hoursTotal:3600, hoursCompleted:2310, individualHours:1180, groupHours:1130,
    hourLog: [
      { id:"h1", category:"individual",          type:"direct",   hours:1180, label:"Individual Supervision" },
      { id:"h2", category:"group",               type:"direct",   hours:1130, label:"Group Supervision" },
      { id:"h3", category:"primary_supervision", type:"direct",   hours:1180, label:"Primary Supervision" },
      { id:"h4", category:"secondary_supervision",type:"direct",  hours:0,    label:"Secondary Supervision" },
    ],
    internHourLog: [
      { id:"h1", category:"individual",          type:"direct",   hours:1180, label:"Individual Supervision" },
      { id:"h2", category:"group",               type:"direct",   hours:1130, label:"Group Supervision" },
      { id:"h3", category:"primary_supervision", type:"direct",   hours:1180, label:"Primary Supervision" },
      { id:"h4", category:"secondary_supervision",type:"direct",  hours:0,    label:"Secondary Supervision" },
      { id:"h5", category:"custom",              type:"indirect", hours:120,  label:"Report Writing" },
      { id:"h6", category:"custom",              type:"indirect", hours:60,   label:"Peer Consultation" },
    ],
    customHourCategories: ["Report Writing","Peer Consultation"],
    flags:[],
    supervisorHoursLog: mkHours([
      { period:"Jan–Jun 2026", individual:14, group:6 },
      { period:"Jul–Dec 2025", individual:28, group:14 },
      { period:"Jan–Jun 2025", individual:26, group:14 },
    ]),
    internReportedHours: mkHours([
      { period:"Jan–Jun 2026", individual:14, group:6 },
      { period:"Jul–Dec 2025", individual:28, group:14 },
      { period:"Jan–Jun 2025", individual:26, group:14 },
    ]),
    sharedWith:[], sessions:[
      { date:"Mar 18, 2026", type:"Individual", duration:"60 min", author:"Alyson", notes:"BPD features case staffing. DBT skills modules reviewed." },
      { date:"Mar 11, 2026", type:"Individual", duration:"60 min", author:"Alyson", notes:"Documentation review. Billing and case note quality." },
    ],
    cases:[
      { id:"C-0031", presenting:"BPD features / Self-harm Hx", sessions:22, lastStaffed:"Mar 18", notes:"DBT Stage 1 — commitment and behavioral targets." },
      { id:"C-0048", presenting:"Grief / Complicated Loss",     sessions:14, lastStaffed:"Mar 11", notes:"Prolonged grief work. Narrative therapy." },
      { id:"C-0059", presenting:"Anxiety, Somatic",             sessions:7,  lastStaffed:"Mar 4",  notes:"Mind-body connection. Grounding practices." },
    ],
    documents:[
      { name:"Supervision Agreement",          date:"Sep 5, 2023",  type:"Contract",   uploadedBy:"supervisor" },
      { name:"LMSW License",                   date:"Sep 5, 2023",  type:"License",    uploadedBy:"intern" },
      { name:"Liability Insurance Certificate", date:"Sep 2, 2025", type:"Insurance",  uploadedBy:"intern" },
      { name:"NASW Supervision Plan",          date:"Sep 5, 2023",  type:"Plan",       uploadedBy:"supervisor" },
      { name:"Mid-year Evaluation",            date:"Feb 15, 2026", type:"Evaluation", uploadedBy:"supervisor" },
    ],
    payments:[],
  },
  { id:4, name:"James Whitfield", preferredName:"Jim", initials:"JW", pronouns:"he/him",
    supervisorRole:"primary", internType:"counseling", discipline:"counseling", credential:"LPC", credentialBody:"CACREP", licenseGoal:"LPC-Associate", startDate:"Feb 2019", status:"inactive", inactiveDate:"Jan 2022", retentionYear:2022, photo:null,
    groupIds:[], listIds:["l2"], proBono:false, paymentStatus:"current",
    hoursTotal:3000, hoursCompleted:3000, individualHours:1500, groupHours:1500,
    hourLog: [
      { id:"h1", category:"individual",          type:"direct",   hours:1500, label:"Individual Supervision" },
      { id:"h2", category:"group",               type:"direct",   hours:1500, label:"Group Supervision" },
      { id:"h3", category:"primary_supervision", type:"direct",   hours:1500, label:"Primary Supervision" },
      { id:"h4", category:"secondary_supervision",type:"direct",  hours:0,    label:"Secondary Supervision" },
    ],
    internHourLog: [
      { id:"h1", category:"individual",          type:"direct",   hours:1500, label:"Individual Supervision" },
      { id:"h2", category:"group",               type:"direct",   hours:1500, label:"Group Supervision" },
      { id:"h3", category:"primary_supervision", type:"direct",   hours:1500, label:"Primary Supervision" },
      { id:"h4", category:"secondary_supervision",type:"direct",  hours:0,    label:"Secondary Supervision" },
    ],
    customHourCategories: [],
    flags:[],
    supervisorHoursLog:[], internReportedHours:[],
    sharedWith:[], sessions:[
      { date:"Dec 14, 2021", type:"Individual", duration:"60 min", author:"Alyson", notes:"Final supervision session. Completed all required hours. Reviewed licensure application." },
    ],
    cases:[], documents:[
      { name:"Supervision Agreement", date:"Feb 5, 2019",  type:"Contract",   uploadedBy:"supervisor" },
      { name:"LPC License",           date:"Feb 5, 2019",  type:"License",    uploadedBy:"intern" },
      { name:"Completion Certificate",date:"Jan 10, 2022", type:"Evaluation", uploadedBy:"supervisor" },
    ],
    payments:[
      { month:"December 2021", amount:200, status:"paid", date:"Dec 1", quarter:"Q4 2021" },
    ],
  },
  { id:5, name:"Sofia Reyes", preferredName:"", initials:"SR", pronouns:"she/they", photo:null, dob:"2000-05-19",
    supervisorRole:"primary", internType:"mft", discipline:"mft", credential:"AMFT", credentialBody:"COAMFTE", licenseGoal:"LMFT", startDate:"Mar 2025", status:"active",
    groupIds:[], listIds:["l1"],
    proBono:false, paymentStatus:"current",
    hoursTotal:3000, hoursCompleted:620, individualHours:310, groupHours:310,
    flags:[],
    hourLog:[
      { id:"h1", category:"individual",  type:"direct",   hours:310, label:"Individual Supervision" },
      { id:"h2", category:"group",       type:"direct",   hours:310, label:"Group Supervision" },
      { id:"h3", category:"conjoint",    type:"direct",   hours:85,  label:"Conjoint/Couple Sessions" },
      { id:"h4", category:"family",      type:"direct",   hours:60,  label:"Family Sessions" },
    ],
    internHourLog:[
      { id:"h1", category:"individual",  type:"direct",   hours:310, label:"Individual Supervision" },
      { id:"h2", category:"group",       type:"direct",   hours:310, label:"Group Supervision" },
      { id:"h3", category:"conjoint",    type:"direct",   hours:85,  label:"Conjoint/Couple Sessions" },
      { id:"h4", category:"family",      type:"direct",   hours:60,  label:"Family Sessions" },
    ],
    customHourCategories:[],
    supervisorHoursLog:[{ period:"Jan–Jun 2025", individual:10, group:6 }],
    internReportedHours:[{ period:"Jan–Jun 2025", individual:10, group:6 }],
    sharedWith:[],
    sessions:[
      { date:"Mar 17, 2026", type:"Individual", duration:"60 min", author:"Alyson", notes:"Reviewed couples case using Gottman framework. Discussed four horsemen identification in session. Sofia navigating strong countertransference with one partner." },
    ],
    cases:[
      { id:"C-0081", presenting:"Couples — Communication / Conflict", sessions:6, lastStaffed:"Mar 17", notes:"Emotionally Focused Therapy approach. Cycle identified. Working on de-escalation." },
      { id:"C-0082", presenting:"Family — Adolescent Acting Out", sessions:4, lastStaffed:"Mar 10", notes:"Structural family therapy. Subsystem boundaries explored." },
    ],
    documents:[
      { name:"Supervision Agreement", date:"Mar 5, 2025",  type:"Contract",  uploadedBy:"supervisor" },
      { name:"AMFT License",          date:"Mar 5, 2025",  type:"License",   uploadedBy:"intern" },
      { name:"Liability Insurance",   date:"Mar 5, 2025",  type:"Insurance", uploadedBy:"intern" },
    ],
    payments:[
      { month:"March 2026",    amount:200, status:"paid", date:"Mar 1", quarter:"Q1 2026" },
      { month:"February 2026", amount:200, status:"paid", date:"Feb 2", quarter:"Q1 2026" },
    ],
  },
  { id:6, name:"Terrence Brown", preferredName:"Terry", initials:"TB", pronouns:"he/him", photo:null, dob:"1990-09-08",
    supervisorRole:"primary", internType:"substance_use", discipline:"substance_use", credential:"CADC-I", credentialBody:"NAADAC", licenseGoal:"CADC-II", startDate:"Jun 2025", status:"active",
    groupIds:[], listIds:["l1"],
    proBono:false, paymentStatus:"current",
    hoursTotal:2000, hoursCompleted:480, individualHours:240, groupHours:240,
    flags:[
      { id:"f10", category:"clinical", note:"Client crisis management — review safety protocol for high-risk SUD clients before next session.", date:"Mar 5, 2026", resolved:false },
    ],
    hourLog:[
      { id:"h1", category:"individual",     type:"direct",   hours:240, label:"Individual Supervision" },
      { id:"h2", category:"group",          type:"direct",   hours:240, label:"Group Supervision" },
      { id:"h3", category:"direct_client",  type:"direct",   hours:180, label:"Direct Client Contact" },
      { id:"h4", category:"treatment_plan", type:"indirect", hours:60,  label:"Treatment Planning" },
    ],
    internHourLog:[
      { id:"h1", category:"individual",     type:"direct",   hours:240, label:"Individual Supervision" },
      { id:"h2", category:"group",          type:"direct",   hours:240, label:"Group Supervision" },
      { id:"h3", category:"direct_client",  type:"direct",   hours:180, label:"Direct Client Contact" },
      { id:"h4", category:"treatment_plan", type:"indirect", hours:60,  label:"Treatment Planning" },
    ],
    customHourCategories:[],
    supervisorHoursLog:[{ period:"Jul–Dec 2025", individual:8, group:4 }],
    internReportedHours:[{ period:"Jul–Dec 2025", individual:8, group:4 }],
    sharedWith:[],
    sessions:[
      { date:"Mar 16, 2026", type:"Individual", duration:"60 min", author:"Alyson", notes:"Reviewed motivational interviewing techniques for ambivalent clients. Terry struggling with staying non-confrontational with resistant client. Discussed change talk elicitation." },
    ],
    cases:[
      { id:"C-0091", presenting:"Opioid Use Disorder — Early Recovery", sessions:8, lastStaffed:"Mar 16", notes:"MAT-assisted. Terry building rapport well. Safety planning in place." },
      { id:"C-0092", presenting:"Alcohol Use Disorder — Co-occurring Depression", sessions:5, lastStaffed:"Mar 9",  notes:"Integrated treatment approach. Coordinating with prescriber." },
    ],
    documents:[
      { name:"Supervision Agreement", date:"Jun 10, 2025", type:"Contract",  uploadedBy:"supervisor" },
      { name:"CADC-I Certificate",    date:"Jun 10, 2025", type:"License",   uploadedBy:"intern" },
      { name:"Liability Insurance",   date:"Jun 10, 2025", type:"Insurance", uploadedBy:"intern" },
    ],
    payments:[
      { month:"March 2026",    amount:200, status:"paid", date:"Mar 1", quarter:"Q1 2026" },
      { month:"February 2026", amount:200, status:"paid", date:"Feb 2", quarter:"Q1 2026" },
    ],
  },
  { id:7, name:"Dana Okonkwo", preferredName:"Dana", initials:"DO", pronouns:"she/her", photo:null, dob:"1993-01-27",
    supervisorRole:"primary", internType:"sos", discipline:"sos", credential:"LPC", credentialBody:"CACREP", licenseGoal:"LPC-S", startDate:"Jan 2026", status:"active",
    groupIds:[], listIds:[],
    proBono:false, paymentStatus:"current",
    hoursTotal:300, hoursCompleted:48, individualHours:24, groupHours:24,
    flags:[],
    hourLog:[
      { id:"h1", category:"sos_individual",  type:"direct",   hours:24, label:"Supervision of Supervision (Individual)" },
      { id:"h2", category:"sos_group",       type:"direct",   hours:24, label:"Supervision of Supervision (Group)" },
      { id:"h3", category:"sos_observation", type:"direct",   hours:6,  label:"Observed Supervision Sessions" },
      { id:"h4", category:"sos_didactic",    type:"indirect", hours:8,  label:"Didactic / Seminar Hours" },
    ],
    internHourLog:[
      { id:"h1", category:"sos_individual",  type:"direct",   hours:24, label:"Supervision of Supervision (Individual)" },
      { id:"h2", category:"sos_group",       type:"direct",   hours:24, label:"Supervision of Supervision (Group)" },
      { id:"h3", category:"sos_observation", type:"direct",   hours:6,  label:"Observed Supervision Sessions" },
      { id:"h4", category:"sos_didactic",    type:"indirect", hours:8,  label:"Didactic / Seminar Hours" },
    ],
    customHourCategories:[],
    supervisorHoursLog:[{ period:"Jan–Mar 2026", individual:6, group:6 }],
    internReportedHours:[{ period:"Jan–Mar 2026", individual:6, group:6 }],
    sharedWith:[],
    sessions:[
      { date:"Mar 18, 2026", type:"Supervision of Supervision", duration:"60 min", author:"Alyson",
        notes:"Reviewed Dana's recent session with her LPC-Intern supervisee. Discussed developmental level assessment and matching supervisory style. Explored Dana's use of the Discrimination Model — she defaulted to teacher role throughout; explored when consultant role might be more appropriate. Assigned: read Bernard (1979) and bring case conceptualization next session." },
    ],
    cases:[
      { id:"SOS-001", presenting:"LPC-Intern presenting countertransference concerns", sessions:3, lastStaffed:"Mar 18", notes:"Dana's intern is working with a trauma client and showing signs of secondary traumatic stress. Coaching Dana on restorative supervision functions." },
    ],
    documents:[
      { name:"Supervision of Supervision Agreement", date:"Jan 8, 2026",  type:"Contract",  uploadedBy:"supervisor" },
      { name:"LPC License",                          date:"Jan 8, 2026",  type:"License",   uploadedBy:"intern" },
      { name:"SOS Supervision Contract Template",    date:"Jan 8, 2026",  type:"Plan",      uploadedBy:"supervisor" },
    ],
    payments:[
      { month:"March 2026",    amount:150, status:"paid",    date:"Mar 1", quarter:"Q1 2026" },
      { month:"February 2026", amount:150, status:"paid",    date:"Feb 3", quarter:"Q1 2026" },
      { month:"January 2026",  amount:150, status:"overdue", date:"—",     quarter:"Q1 2026" },
    ],
  },
];

const ALL_STAT_OPTIONS = [
  { id:"active",    label:"Active Supervisees"      },
  { id:"hours",     label:"Hours Logged"            },
  { id:"groups",    label:"Supervision Groups"      },
  { id:"overdue",   label:"Payments Overdue"        },
  { id:"primary",   label:"Primary Interns"         },
  { id:"secondary", label:"Secondary Interns"       },
  { id:"student",   label:"Student Interns"         },
  { id:"licensed",  label:"State Licensed"          },
  { id:"sos",       label:"Supervision of Supervision" },
  { id:"flagged",   label:"Flagged Interns"         },
];
const DEFAULT_STATS    = ["active","hours","overdue","flagged"];
const DEFAULT_SECTIONS = [
  { id:"reminders",  label:"Reminders & Deadlines"  },
  { id:"quickactions",  label:"Quick Actions"      },
  { id:"supervisees",   label:"Supervisees"        },
  { id:"grplist",       label:"Supervision Groups" },
  { id:"sharedwithme",  label:"Shared with Me"     },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const dn    = (i) => i.preferredName || i.name.split(" ")[0]; // display name — preferred or first name
// docTC returns [bg, color] for a document type — uses fixed accessible colors with shape+label as primary differentiator
const docTC = (type) => ({
  Contract:   ["#E8F0FB","#2A4E8A"],   // Blue — agreements/legal
  License:    ["#E8F5EE","#2E7A4E"],   // Green — credentials
  Insurance:  ["#FAF2E0","#7A5C1A"],   // Warm gold — coverage
  Plan:       ["#F0ECE4","#5A5450"],   // Neutral — plans
  Evaluation: ["#F2EDFB","#6B3FA0"],   // Purple — assessments
}[type] || ["#F0ECE4","#5A5450"]);
// ── Discipline & credential reference data ─────────────────────────────────
const DISCIPLINES = [
  { id:"counseling",    label:"Counseling",                  color:S.teal,    bg:S.tealLight   },
  { id:"mft",           label:"Marriage & Family Therapy",   color:"#7A5C1A", bg:"#FAF2E0"     },
  { id:"social_work",   label:"Social Work",                 color:S.blue,    bg:S.blueLight   },
  { id:"substance_use", label:"Substance Use Counseling",    color:"#5C1A7A", bg:"#F2E0FA"     },
  { id:"psychology",    label:"Psychology",                  color:S.coral,   bg:S.coralLight  },
  { id:"sos",           label:"Supervision of Supervision",  color:"#1A6B5C", bg:"#E0F5F0"     },
  { id:"student",       label:"Student Intern",              color:S.purple,  bg:S.purpleLight },
  { id:"other",         label:"Other / Custom",              color:"#5A5450", bg:"#F0ECE4"     },
];

const CREDENTIALS_BY_DISCIPLINE = {
  counseling:    ["LPC-Intern","LPC-Associate","LPC","LPCC","LPCC-A","LCMHC","LCMHC-A","NCC","CACREP Practicum Student"],
  mft:           ["MFT-Intern","AMFT","LMFT-A","LMFT","MFTI","IMFT"],
  social_work:   ["LBSW","LSW","LGSW","LMSW","LISW","LICSW","LCSW","LCSW-C"],
  substance_use: ["CADC-I","CADC-II","CADC","LADC","LADC-I","LCDC","LCDC-I","CSAC","CAS","CASAC","SUDPT","SUDP","RADT"],
  psychology:    ["Doctoral Intern","Postdoctoral Resident","Psychologist","ABPP"],
  sos:           ["LPC","LCSW","LMFT","LCDC","Psychologist","LPC-S (in training)","LCSW-S (in training)","LMFT-S (in training)"],
  student:       ["Practicum Student","Internship Student","Field Placement Student"],
  other:         ["Custom — enter below"],
};

const CREDENTIAL_BODIES = [
  "CACREP","COAMFTE","CSWE","NAADAC","APA","NASW","NBCC","ACES","State Board","University","Other"];

const GOAL_BY_DISCIPLINE = {
  counseling:    ["LPC","LPCC","LCMHC","NCC"],
  mft:           ["LMFT"],
  social_work:   ["LCSW","LICSW","LISW"],
  substance_use: ["CADC-II","LADC","LCDC","CSAC","CASAC"],
  psychology:    ["Licensed Psychologist","ABPP"],
  sos:           ["LPC-S","LCSW-S","LMFT-S","AAMFT Approved Supervisor","NAADAC Supervisor","APA-Designated Supervisor"],
  student:       ["LPC","LMFT","LCSW","LCDC","Other"],
  other:         ["Custom"],
};

const HOUR_CATEGORIES_BY_DISCIPLINE = {
  counseling:    [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"},{id:"primary_sup",label:"Primary Supervision",type:"direct"},{id:"secondary_sup",label:"Secondary Supervision",type:"direct"},{id:"didactic",label:"Didactic Hours",type:"indirect"}],
  mft:           [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"},{id:"conjoint",label:"Conjoint/Couple Sessions",type:"direct"},{id:"family",label:"Family Sessions",type:"direct"}],
  social_work:   [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"},{id:"peer_consult",label:"Peer Consultation",type:"indirect"}],
  substance_use: [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"},{id:"direct_client",label:"Direct Client Contact",type:"direct"},{id:"treatment_plan",label:"Treatment Planning",type:"indirect"}],
  psychology:    [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"},{id:"assessment",label:"Assessment Hours",type:"direct"},{id:"intervention",label:"Intervention Hours",type:"direct"},{id:"consultation",label:"Consultation",type:"indirect"}],
  sos:           [{id:"sos_individual",label:"Supervision of Supervision (Individual)",type:"direct"},{id:"sos_group",label:"Supervision of Supervision (Group)",type:"direct"},{id:"sos_observation",label:"Observed Supervision Sessions",type:"direct"},{id:"sos_didactic",label:"Didactic / Seminar Hours",type:"indirect"},{id:"sos_case",label:"Case Consultation",type:"indirect"}],
  student:       [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"}],
  other:         [{id:"individual",label:"Individual Supervision",type:"direct"},{id:"group",label:"Group Supervision",type:"direct"}],
};

const discStyle = (discipline) => DISCIPLINES.find(d=>d.id===discipline) || DISCIPLINES.find(d=>d.id==="other");
const itSty = (t) => {
  const d = discStyle(t);
  return { label: d.label, color: d.color, bg: d.bg };
};
const rlSty = (r) => r==="primary" ? { label:"Primary Intern", color:S.amber, bg:S.amberLight }  : { label:"Secondary Intern", color:S.coral, bg:S.coralLight };
const pmSum = (p) => { const on=PERM_DEFS.filter(d=>p[d.id]); return !on.length?"No access":on.length===PERM_DEFS.length?"Full access":on.slice(0,2).map(d=>d.label).join(", ")+(on.length>2?` +${on.length-2}`:""); };
const retSt = (i) => { if(i.status!=="inactive"||!i.retentionYear) return null; const y=2026-i.retentionYear,l=7-y; if(l<=0) return {label:"Deletion overdue",color:S.red,bg:S.redLight}; if(l<=1) return {label:"Delete in <1 yr",color:S.amber,bg:S.amberLight}; return {label:`${l} yrs retention`,color:"#7A7060",bg:"#F0ECE4"}; };
const activeFlags = (i) => i.flags?.filter(f=>!f.resolved)||[];

const downloadCSV = (rows,filename) => { const csv=rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n"); const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download=filename; a.click(); };
const downloadTXT = (text,filename) => { const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"text/plain"})); a.download=filename; a.click(); };

const buildReport = (intern,groups,opts) => {
  const L=[]; const sep="─".repeat(56);
  L.push("═".repeat(56)); L.push("SUPTRACK — SUPERVISEE REPORT"); L.push("═".repeat(56));
  L.push(`Generated:  March 21, 2026`); L.push(`Supervisor: Alyson K.`); L.push("");
  L.push(sep); L.push("SUPERVISEE");
  L.push(`Name:        ${intern.name}${intern.preferredName?" (goes by "+intern.preferredName+")":""}`);
  if(intern.pronouns) L.push(`Pronouns:    ${intern.pronouns}`);
  L.push(`Credential:  ${intern.credentialBody} — ${intern.credential}`);
  L.push(`Goal:        ${intern.licenseGoal}`);
  L.push(`Role:        ${intern.supervisorRole==="primary"?"Primary Supervisor":"Secondary Supervisor"}`);
  L.push(`Start:       ${intern.startDate}`);
  L.push(`Status:      ${intern.status}`); L.push("");
  if(opts.hours){ L.push(sep); L.push("HOURS");
    L.push(`Total: ${intern.hoursCompleted} / ${intern.hoursTotal} (${Math.round(intern.hoursCompleted/intern.hoursTotal*100)}%)`);
    L.push(`Individual: ${intern.individualHours}    Group: ${intern.groupHours}`);
    if(intern.supervisorHoursLog?.length){ L.push(""); L.push("6-Month Period Breakdown:");
      intern.supervisorHoursLog.forEach((row,idx)=>{
        const ir=intern.internReportedHours?.[idx];
        L.push(`  ${row.period}`);
        L.push(`    Supervisor log:   Ind ${row.individual}  Grp ${row.group}`);
        if(ir) L.push(`    Intern reported:  Ind ${ir.individual}  Grp ${ir.group}${(ir.individual!==row.individual||ir.group!==row.group)?" ← DISCREPANCY":""}`);
      });
    } L.push("");
  }
  if(opts.sessions&&(intern.sessions||[]).length){ L.push(sep); L.push("SESSION NOTES");
    intern.sessions.forEach(s=>{ L.push(`${s.date} | ${s.type} | ${s.duration} | by ${s.author}`); L.push(`  ${s.notes}`); L.push(""); });
    groups.filter(g=>(intern.groupIds||[]).includes(g.id)).forEach(g=>g.sessions.forEach(s=>{ L.push(`${s.date} | ${g.name} (group) | by ${s.author}`); L.push(`  ${s.notes}`); L.push(""); }));
  }
  if(opts.cases&&(intern.cases||[]).length){ L.push(sep); L.push("CASES STAFFED");
    intern.cases.forEach(c=>{ L.push(`${c.id} — ${c.presenting}`); L.push(`  ${c.sessions} sessions | Last: ${c.lastStaffed}`); L.push(`  ${c.notes}`); L.push(""); });
  }
  if(opts.flags&&intern.flags?.length){ L.push(sep); L.push("FLAGS");
    intern.flags.forEach(f=>{ L.push(`[${f.resolved?"RESOLVED":"OPEN"}] ${f.category.toUpperCase()} — ${f.date}`); L.push(`  ${f.note}`); L.push(""); });
  }
  if(opts.documents&&(intern.documents||[]).length){ L.push(sep); L.push("DOCUMENTS ON FILE");
    intern.documents.forEach(d=>L.push(`  ${d.type.padEnd(12)} ${d.name} (${d.date}, by ${d.uploadedBy})`)); L.push("");
  }
  if(opts.payments&&!intern.proBono&&intern.payments.length){ L.push(sep); L.push("PAYMENT HISTORY");
    intern.payments.forEach(p=>L.push(`  ${p.month.padEnd(18)} $${p.amount}  ${p.status.toUpperCase()}  ${p.date}`)); L.push("");
  }
  L.push("═".repeat(56)); L.push("End of report — SupTrack"); return L.join("\n");
};

// ── Shared UI ──────────────────────────────────────────────────────────────
const Avatar = ({initials,size=40,color,textColor,T,photo,editable,onPhotoChange}) => {
  const t=T||THEMES.sage;
  const handleFile=(e)=>{ const file=e.target.files?.[0]; if(!file) return; const r=new FileReader(); r.onload=(ev)=>onPhotoChange&&onPhotoChange(ev.target.result); r.readAsDataURL(file); };
  return <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    {photo
      ? <img src={photo} alt={initials} style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",display:"block"}}/>
      : <div style={{width:size,height:size,borderRadius:"50%",background:color||t.accentMid,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui, sans-serif",fontSize:size*0.33,color:textColor||t.accentText}}>{initials}</div>}
    {editable&&<label style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(0,0,0,0.42)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:0,transition:"opacity 0.15s"}}
      onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=0}>
      <span style={{fontSize:Math.max(10,size*0.28),color:"#fff"}}>📷</span>
      <input type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
    </label>}
  </div>;
};

const Badge = ({children,color,bg}) => (
  <span style={{background:bg,color,borderRadius:4,padding:"2px 9px",fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"0.03em",fontWeight:500,whiteSpace:"nowrap"}}>{children}</span>
);

const Btn = ({children,onClick,variant="primary",small,disabled,style={},T}) => {
  const t=T||THEMES.sage;
  const gradBg = t.isGradient ? t.gradient : t.accent;
  const s={
    primary:{background:t.isGradient?t.gradient:t.accent,backgroundSize:t.isGradient?"200% 200%":undefined,animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",border:"none"},
    secondary:{background:"none",color:t.muted,border:`1px solid ${t.border}`},
    soft:{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`},
    danger:{background:S.red,color:"#fff",border:"none"},
  }[variant]||{};
  return <button onClick={onClick} disabled={disabled}
    style={{...s,borderRadius:8,padding:small?"5px 12px":"10px 18px",fontSize:small?12:13,cursor:disabled?"default":"pointer",fontFamily:"'DM Mono',monospace",opacity:disabled?0.5:1,...style}}>
    {children}
  </button>;
};

const PBar = ({value,total,T}) => {
  const t=T||THEMES.sage; const pct=Math.min(100,Math.round(value/total*100));
  const barBg = t.isGradient ? t.gradient : t.accent;
  return <div style={{width:"100%"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{value.toLocaleString()} / {total.toLocaleString()} hrs</span><span style={{fontSize:12,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{pct}%</span></div><div style={{height:7,background:t.borderLight,borderRadius:999,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:barBg,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999,transition:"width 0.7s cubic-bezier(.4,0,.2,1)"}}/></div></div>;
};

const StatCard = ({label,value,sub,color,onClick,T}) => {
  const t=T||THEMES.sage;
  return <div onClick={onClick} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",cursor:onClick?"pointer":"default",transition:"box-shadow 0.15s"}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";}}
    onMouseLeave={e=>{if(onClick)e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)";}}>
    <div style={{fontSize:11,color:t.muted,marginBottom:8,fontFamily:"'DM Mono',monospace",letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}{onClick&&<span style={{marginLeft:6,color:t.faint}}>→</span>}</div>
    <div style={{fontSize:28,fontFamily:"inherit",color:color||t.text,lineHeight:1}}>{value}</div>
    {sub&&<div style={{fontSize:12,color:t.muted,marginTop:5}}>{sub}</div>}
  </div>;
};

const RoleBadge = ({role}) => { const s=rlSty(role); return <Badge color={s.color} bg={s.bg}>{s.label}</Badge>; };
const TypeBadge = ({type}) => { const s=itSty(type); return <Badge color={s.color} bg={s.bg}>{s.label}</Badge>; };
const PayBadge  = ({intern,T}) => {
  const t=T||THEMES.sage;
  if(intern.proBono) return <Badge color={S.purple} bg={S.purpleLight}>Pro bono</Badge>;
  if(intern.paymentStatus==="overdue") return <Badge color={t.accentText} bg={t.accentLight}>⚠ Overdue</Badge>;
  return <Badge color={t.accentText} bg={t.accentLight}>✓ Current</Badge>;
};

const FlagDots = ({intern}) => {
  const af=activeFlags(intern); if(!af.length) return null;
  return <div style={{display:"flex",gap:3,alignItems:"center"}}>
    {af.slice(0,4).map(f=>{ const cat=FLAG_CATS.find(c=>c.id===f.category)||FLAG_CATS[5]; return <div key={f.id} title={`${cat.label}: ${f.note}`} style={{width:8,height:8,borderRadius:"50%",background:cat.color,flexShrink:0}}/> })}
    {af.length>4&&<span style={{fontSize:10,color:"#7A7060",fontFamily:"'DM Mono',monospace"}}>+{af.length-4}</span>}
  </div>;
};

const SharedAvatars = ({sharedWith,size=22,colleagues=[]}) => {
  if(!sharedWith?.length) return null;
  return <div style={{display:"flex",alignItems:"center",gap:2}}>
    {sharedWith.map((s,i)=>{ const c=colleagues.find(x=>x.id===s.colleagueId); if(!c) return null; return <div key={c.id} title={`${c.name}: ${pmSum(s.perms)}`} style={{width:size,height:size,borderRadius:"50%",background:c.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.38,color:"#fff",border:"2px solid white",marginLeft:i>0?-6:0,zIndex:10-i,flexShrink:0}}>{c.initials}</div>; })}
    <span style={{fontSize:11,color:"#9A9185",fontFamily:"'DM Mono',monospace",marginLeft:4}}>shared</span>
  </div>;
};

// ── Flag Modal ─────────────────────────────────────────────────────────────
function FlagModal({intern,onSave,onClose,T}) {
  const t=T||THEMES.sage;
  const [flags,setFlags]=useState(intern.flags?.map(f=>({...f}))||[]);
  const [adding,setAdding]=useState(false);
  const [newCat,setNewCat]=useState("documentation");
  const [newNote,setNewNote]=useState("");

  const addFlag=()=>{if(!newNote.trim()) return; setFlags(p=>[...p,{id:`f${Date.now()}`,category:newCat,note:newNote.trim(),date:"Mar 21, 2026",resolved:false}]); setNewNote(""); setAdding(false);};
  const toggleResolved=(id)=>setFlags(p=>p.map(f=>f.id===id?{...f,resolved:!f.resolved}:f));
  const removeFlag=(id)=>setFlags(p=>p.filter(f=>f.id!==id));

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,padding:"26px 28px",width:500,maxHeight:"80vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.14)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div><div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:3}}>Flags — {dn(intern)}</div><div style={{fontSize:13,color:t.muted}}>Track things to revisit</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.muted,padding:4}}>✕</button>
      </div>
      {flags.length===0&&!adding&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:18,textAlign:"center",fontSize:14,color:t.muted,marginBottom:14}}>No flags yet</div>}
      {flags.map(f=>{ const cat=FLAG_CATS.find(c=>c.id===f.category)||FLAG_CATS[5]; return (
        <div key={f.id} style={{background:t.surfaceAlt,borderLeft:`3px solid ${f.resolved?"#C0B9AC":cat.color}`,borderRadius:10,padding:"14px 16px",marginBottom:10,opacity:f.resolved?0.6:1}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,marginBottom:6}}><Badge color={cat.color} bg={cat.bg}>{cat.label}</Badge><span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{f.date}</span></div>
              <p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.6,textDecoration:f.resolved?"line-through":"none"}}>{f.note}</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:4,flexShrink:0}}>
              <button onClick={()=>toggleResolved(f.id)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:f.resolved?t.accentText:t.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>{f.resolved?"↩ Reopen":"✓ Resolve"}</button>
              <button onClick={()=>removeFlag(f.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:S.red,fontFamily:"'DM Mono',monospace",textAlign:"right"}}>Remove</button>
            </div>
          </div>
        </div>
      ); })}
      {adding ? (
        <div style={{background:t.surfaceAlt,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
          <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
            {FLAG_CATS.map(c=><button key={c.id} onClick={()=>setNewCat(c.id)} style={{background:newCat===c.id?c.bg:"none",color:newCat===c.id?c.color:t.muted,border:`1px solid ${newCat===c.id?c.color:t.border}`,borderRadius:6,padding:"4px 12px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{c.label}</button>)}
          </div>
          <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Describe what to flag and why..." style={{width:"100%",minHeight:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.surface,resize:"vertical",boxSizing:"border-box",outline:"none"}}/>
          <div style={{display:"flex",gap:8,marginTop:8}}><Btn T={t} small onClick={addFlag}>Add Flag</Btn><Btn T={t} variant="secondary" small onClick={()=>{setAdding(false);setNewNote("");}}>Cancel</Btn></div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)} style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:10,padding:"10px 18px",fontSize:13,color:t.muted,cursor:"pointer",width:"100%",fontFamily:"'DM Mono',monospace",marginBottom:14}}>+ Add flag</button>
      )}
      <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:8,borderTop:`1px solid ${t.border}`}}>
        <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn T={t} onClick={()=>onSave(flags)}>Save flags</Btn>
      </div>
    </div>
  </div>;
}

// ── Share Link Modal ───────────────────────────────────────────────────────
function ShareLinkModal({intern,onClose,T}) {
  const t=T||THEMES.sage;
  const [sections,setSections]=useState({hours:true,sessions:true,documents:true,payments:false,cases:false});
  const [copied,setCopied]=useState(false);
  const [expiry,setExpiry]=useState("7days");
  const toggle=(k)=>setSections(p=>({...p,[k]:!p[k]}));
  const on=Object.entries(sections).filter(([,v])=>v).map(([k])=>k);
  const fakeUrl=`https://app.suptrack.io/intern/${intern.id}/shared?sections=${on.join(",")}&exp=${expiry}&token=st_${Math.random().toString(36).slice(2,10)}`;

  const copy=()=>{ navigator.clipboard?.writeText(fakeUrl); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  const sectionDefs=[
    {id:"hours",    label:"Hours & progress",  desc:"Their hour totals and licensure tracker"},
    {id:"sessions", label:"Session notes",      desc:"Notes from supervision sessions"},
    {id:"documents",label:"Documents",          desc:"Their uploaded and shared documents"},
    {id:"payments", label:"Payment history",    desc:"Invoices and payment status"},
    {id:"cases",    label:"Cases staffed",      desc:"Case log from supervision"},
  ];

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,padding:"26px 28px",width:500,boxShadow:"0 24px 64px rgba(0,0,0,0.14)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div><div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:3}}>Send file link — {dn(intern)}</div><div style={{fontSize:13,color:t.muted}}>Choose what they can see, then share the link</div></div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.muted,padding:4}}>✕</button>
      </div>
      <div style={{background:t.surfaceAlt,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
        {sectionDefs.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.borderLight}`}}>
            <div><div style={{fontSize:14,color:t.text}}>{s.label}</div><div style={{fontSize:12,color:t.muted}}>{s.desc}</div></div>
            <button onClick={()=>toggle(s.id)} style={{background:sections[s.id]?t.accent:t.border,border:"none",borderRadius:12,width:40,height:22,cursor:"pointer",position:"relative",transition:"background 0.15s",flexShrink:0}}>
              <span style={{position:"absolute",top:2,left:sections[s.id]?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.15s"}}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:13,color:t.muted,marginBottom:8,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Link expires</div>
        <div style={{display:"flex",gap:8}}>
          {[["24hours","24 hours"],["7days","7 days"],["30days","30 days"],["never","Never"]].map(([v,l])=>(
            <button key={v} onClick={()=>setExpiry(v)} style={{background:expiry===v?t.accentLight:"none",color:expiry===v?t.accentText:t.muted,border:`1px solid ${expiry===v?t.accentMid:t.border}`,borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{fakeUrl}</span>
        <button onClick={copy} style={{background:copied?t.accent:t.surface,color:copied?"#fff":t.text,border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",flexShrink:0,transition:"all 0.15s"}}>{copied?"✓ Copied":"Copy"}</button>
      </div>
      <div style={{fontSize:12,color:t.muted,marginBottom:16}}>This link will give {dn(intern)} read-only access to the selected sections of their file. Payment info is read-only; they cannot edit supervision notes through this link.</div>
      <div style={{display:"flex",justifyContent:"flex-end"}}><Btn T={t} variant="secondary" onClick={onClose}>Close</Btn></div>
    </div>
  </div>;
}

// ── Share Modal (colleagues) ───────────────────────────────────────────────
function ShareModal({title,sharedWith,onSave,onClose,colleagues,setColleagues,T}) {
  const t=T||THEMES.sage;
  const [shares,setShares]=useState(()=>sharedWith.map(s=>({...s,perms:{...s.perms}})));
  const [adding,setAdding]=useState(false);
  const [sel,setSel]=useState("");
  const [newName,setNewName]=useState("");
  const [newEmail,setNewEmail]=useState("");
  const [addMode,setAddMode]=useState("existing");

  const existing=(colleagues||[]).filter(c=>!shares.find(s=>s.colleagueId===c.id));
  const permGroups=[...new Set(PERM_DEFS.map(p=>p.group))];

  const addExisting=()=>{
    if(!sel) return;
    setShares(p=>[...p,{colleagueId:sel,perms:{...DEFAULT_PERMS}}]);
    setSel("");
    setAdding(false);
  };

  const addNew=()=>{
    if(!newName.trim()) return;
    const id=`c_${Date.now()}`;
    const colors=["#7A3FA0","#1A6A7A","#7A4A20","#2D5A3D","#1A3A8C"];
    const colorLights=["#F0E8FA","#E3F3F6","#F5EDE0","#EEF4EE","#EFF6FF"];
    const idx=(colleagues||[]).length % colors.length;
    const newColleague={id,name:newName.trim(),initials:newName.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(),email:newEmail.trim()||"",color:colors[idx],colorLight:colorLights[idx]};
    setColleagues&&setColleagues(p=>[...p,newColleague]);
    setShares(p=>[...p,{colleagueId:id,perms:{...DEFAULT_PERMS}}]);
    setNewName("");setNewEmail("");setAdding(false);
  };

  const togglePerm=(colleagueId,permId)=>{
    setShares(p=>p.map(s=>s.colleagueId!==colleagueId?s:{...s,perms:{...s.perms,[permId]:!s.perms[permId]}}));
  };

  const removeShare=(colleagueId)=>{
    setShares(p=>p.filter(s=>s.colleagueId!==colleagueId));
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div style={{background:t.surface,borderRadius:18,padding:"26px 28px",width:540,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.16)"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
          <div>
            <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:2}}>Share access</div>
            <div style={{fontSize:13,color:t.muted}}>{title}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.faint,padding:4,lineHeight:1}}>✕</button>
        </div>

        {/* Current shares */}
        {shares.length===0&&!adding&&(
          <div style={{background:t.surfaceAlt,borderRadius:10,padding:18,textAlign:"center",fontSize:13,color:t.muted,marginBottom:14}}>
            Not shared with anyone yet. Add a colleague below.
          </div>
        )}

        {shares.map(share=>{
          const col=(colleagues||[]).find(c=>c.id===share.colleagueId);
          if(!col) return null;
          return (
            <div key={col.id} style={{background:t.surfaceAlt,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <Avatar initials={col.initials} size={34} color={col.color} textColor="#fff"/>
                  <div>
                    <div style={{fontSize:14,color:t.text,fontWeight:500}}>{col.name}</div>
                    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{col.email}</div>
                  </div>
                </div>
                <button onClick={()=>removeShare(col.id)}
                  style={{background:"none",border:`1px solid ${S.red}30`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>
                  Remove
                </button>
              </div>
              {permGroups.map(g=>(
                <div key={g} style={{marginBottom:8}}>
                  <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>{g}</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {PERM_DEFS.filter(p=>p.group===g).map(perm=>{
                      const on=share.perms[perm.id];
                      return (
                        <button key={perm.id} onClick={()=>togglePerm(col.id,perm.id)}
                          style={{background:on?t.accentLight:t.surface,color:on?t.accentText:t.muted,border:`1px solid ${on?t.accentMid:t.border}`,borderRadius:6,padding:"4px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}}>
                          {on?"✓ ":""}{perm.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        {/* Add form */}
        {adding ? (
          <div style={{background:t.surfaceAlt,border:`1px solid ${t.accentMid}`,borderRadius:12,padding:"16px 18px",marginBottom:14}}>
            {/* Toggle existing vs new */}
            <div style={{display:"flex",gap:0,border:`1px solid ${t.border}`,borderRadius:8,overflow:"hidden",marginBottom:14,width:"fit-content"}}>
              {[["existing","Existing colleague"],["new","Add new person"]].map(([id,label],i)=>(
                <button key={id} onClick={()=>setAddMode(id)}
                  style={{background:addMode===id?t.accentLight:"none",color:addMode===id?t.accentText:t.muted,border:"none",borderRight:i===0?`1px solid ${t.border}`:"none",padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                  {label}
                </button>
              ))}
            </div>

            {addMode==="existing" ? (
              existing.length>0 ? (
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <select value={sel} onChange={e=>setSel(e.target.value)}
                    style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.surface,outline:"none"}}>
                    <option value="">Select colleague...</option>
                    {existing.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={addExisting}
                    style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"}}>
                    Add
                  </button>
                  <button onClick={()=>{setAdding(false);setSel("");}}
                    style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:13,color:t.muted,fontFamily:"inherit"}}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{fontSize:13,color:t.faint,padding:"8px 0"}}>All colleagues already added. Switch to "Add new person" to add someone else.</div>
              )
            ) : (
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Name *</div>
                    <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Full name"
                      style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                  <div>
                    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Email</div>
                    <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="email@example.com" type="email"
                      style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={addNew}
                    style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                    Add
                  </button>
                  <button onClick={()=>{setAdding(false);setNewName("");setNewEmail("");}}
                    style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",fontSize:13,color:t.muted,fontFamily:"inherit"}}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button onClick={()=>{setAdding(true);setAddMode("existing");}}
            style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:10,padding:"10px 18px",fontSize:13,color:t.muted,cursor:"pointer",width:"100%",fontFamily:"'DM Mono',monospace",marginBottom:14,transition:"all 0.1s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor=t.accentMid;e.currentTarget.style.color=t.accentText;}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.muted;}}>
            + Add colleague
          </button>
        )}

        {/* Footer */}
        <div style={{display:"flex",justifyContent:"flex-end",gap:10,paddingTop:12,borderTop:`1px solid ${t.border}`}}>
          <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn T={t} onClick={()=>onSave(shares)}>Save</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Export Modal ───────────────────────────────────────────────────────────
function ExportModal({intern,groups,onClose,T}) {
  const t=T||THEMES.sage;
  const [opts,setOpts]=useState({hours:true,sessions:true,cases:true,documents:true,payments:false,flags:false});
  const items=[
    {id:"hours",    label:"Hours & 6-month breakdown"},
    {id:"sessions", label:"Session notes"},
    {id:"cases",    label:"Cases staffed"},
    {id:"documents",label:"Documents on file"},
    {id:"flags",    label:"Flags & notes"},
    {id:"payments", label:"Payment history"},
    {id:"evals",    label:"Evaluations"},
  ];

  const buildLicensurePacket = () => {
    const L=[];
    L.push("═".repeat(60)); L.push("SUPTRACK — LICENSURE PACKET"); L.push("═".repeat(60));
    L.push(`Generated: March 21, 2026  |  Supervisor: Alyson K., LPC-S`); L.push("");
    L.push("TO WHOM IT MAY CONCERN:"); L.push("");
    L.push(`This letter certifies that ${intern.name} has completed the required supervised clinical hours`);
    L.push(`for the ${intern.licenseGoal} credential under my supervision.`); L.push("");
    L.push(`Supervisee:   ${intern.name}${intern.pronouns?" ("+intern.pronouns+")":""}`);
    L.push(`Credential:   ${intern.credentialBody} — ${intern.credential}`);
    L.push(`Goal:         ${intern.licenseGoal}`);
    L.push(`Supervision period: ${intern.startDate} – ${intern.status==="inactive"?intern.inactiveDate||"Present":"Present"}`);
    L.push(""); L.push("─".repeat(60)); L.push("HOURS SUMMARY"); L.push("─".repeat(60));
    const supLog=intern.hourLog||[];
    L.push(`Total hours completed: ${intern.hoursCompleted} of ${intern.hoursTotal} required`);
    L.push(`Individual supervision: ${intern.individualHours} hrs`);
    L.push(`Group supervision: ${intern.groupHours} hrs`);
    if(supLog.length){
      supLog.forEach(e=>L.push(`  ${e.label}: ${e.hours} hrs (${e.type})`));
    }
    L.push(""); L.push("─".repeat(60)); L.push("SUPERVISOR ATTESTATION"); L.push("─".repeat(60));
    L.push(`I, Alyson K., LPC-S, hereby attest that the above information is accurate`);
    L.push(`and that ${intern.name.split(" ")[1]||intern.name} has met the supervisory requirements`);
    L.push(`as outlined by the relevant licensing board.`); L.push("");
    L.push("Supervisor signature: ______________________");
    L.push("Date: ____________________________________");
    L.push("License number: __________________________");
    L.push(""); L.push("═".repeat(60)); L.push("Generated by SupTrack · suptrack.io");
    return L.join("\n");
  };
  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,padding:"26px 28px",width:440,boxShadow:"0 24px 64px rgba(0,0,0,0.14)"}} onClick={e=>e.stopPropagation()}>
      <div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:4}}>Export report</div>
      <div style={{fontSize:13,color:t.muted,marginBottom:18}}>{intern.name} — choose what to include</div>
      <div style={{background:t.surfaceAlt,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
        {items.map(s=>(
          <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${t.borderLight}`}}>
            <span style={{fontSize:14,color:t.text}}>{s.label}</span>
            <button onClick={()=>setOpts(p=>({...p,[s.id]:!p[s.id]}))} style={{background:opts[s.id]?t.accent:t.border,border:"none",borderRadius:12,width:40,height:22,cursor:"pointer",position:"relative",transition:"background 0.15s"}}>
              <span style={{position:"absolute",top:2,left:opts[s.id]?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.15s"}}/>
            </button>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
        <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn T={t} variant="soft" onClick={()=>{downloadTXT(buildLicensurePacket(),`SupTrack_${intern.name.replace(/ /g,"_")}_LicensurePacket.txt`);onClose();}}>📋 Licensure packet</Btn>
        <Btn T={t} onClick={()=>{downloadTXT(buildReport(intern,groups,opts),`SupTrack_${intern.name.replace(/ /g,"_")}_Report.txt`);onClose();}}>Download report</Btn>
      </div>
    </div>
  </div>;
}

// ── Intern Card ────────────────────────────────────────────────────────────
const InternCard = ({intern,lists,groups,colleagues,onClick,onGroupClick,T}) => {
  const t=T||THEMES.sage; const rs=retSt(intern); const af=activeFlags(intern);
  const memberLists  = lists.filter(l=>(intern.listIds||[]).includes(l.id));
  const memberGroups = groups.filter(g=>(intern.groupIds||[]).includes(g.id));
  return <div onClick={onClick} style={{background:t.surface,border:`1px solid ${t.border}`,borderLeft:af.length?`3px solid ${FLAG_CATS.find(c=>c.id===af[0]?.category)?.color||"#B87D2A"}`:undefined,borderRadius:14,padding:"16px 20px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:14,opacity:intern.status==="inactive"?0.75:1,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s",overflow:"hidden"}}
    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)"}
    onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
    <Avatar initials={intern.initials} size={44} T={t} photo={intern.photo} style={{flexShrink:0,marginTop:2}}/>
    <div style={{flex:1,minWidth:0}}>
      {/* Row 1: name + badges — all wrap naturally */}
      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
        <span style={{fontFamily:"inherit",fontSize:16,color:t.text,fontWeight:500}}>{dn(intern)}</span>
        {intern.preferredName&&<span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{intern.name}</span>}
        {intern.pronouns&&<span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.pronouns}</span>}
        <RoleBadge role={intern.supervisorRole}/>
        <TypeBadge type={intern.discipline||intern.internType}/>
        {intern.status==="active"&&<PayBadge intern={intern} T={t}/>}
        {intern.status==="inactive"&&<Badge color="#7A7060" bg="#F0ECE4">Inactive</Badge>}
        {rs&&<Badge color={rs.color} bg={rs.bg}>{rs.label}</Badge>}
        {af.length>0&&<FlagDots intern={intern}/>}
      </div>
      {/* Row 2: credential info */}
      <div style={{fontSize:12,color:t.muted,marginBottom:8,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{intern.credentialBody} — {intern.credential} · Since {intern.startDate}</div>
      {/* Row 3: progress bar */}
      <PBar value={intern.hoursCompleted} total={intern.hoursTotal} T={t}/>
      {/* Row 4: lists, groups, shared — wrap below */}
      {(memberLists.length>0||memberGroups.length>0||intern.sharedWith?.length>0)&&
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8,alignItems:"center"}}>
          {memberLists.map(l=><Badge key={l.id} color={l.color} bg={l.colorLight}>{l.name}</Badge>)}
          {memberGroups.map(g=><span key={g.id} onClick={e=>{e.stopPropagation();onGroupClick&&onGroupClick(g.id);}} style={{cursor:onGroupClick?"pointer":"default"}}>
            <Badge color={g.color} bg={g.colorLight}>{g.name}</Badge>
          </span>)}
          {intern.sharedWith?.length>0&&<SharedAvatars sharedWith={intern.sharedWith} colleagues={colleagues||[]}/>}
        </div>}
    </div>
  </div>;
};

// ── Hours Comparison Tab ───────────────────────────────────────────────────
// ── AI Session Note Modal ──────────────────────────────────────────────────
// ── QuickActionModal — handles dashboard quick action buttons ─────────────────
function QuickActionModal({action, interns, groups, onClose, onUpdateIntern, T}) {
  const t = T||THEMES.sage;
  const activeInterns = interns.filter(i=>i.status==="active"&&!i.proBono);
  const activeAll     = interns.filter(i=>i.status==="active");
  const [selectedId, setSelectedId] = useState(activeAll[0]?.id||null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [uploaded, setUploaded] = useState(null);
  const [sessionType, setSessionType] = useState("Individual");
  const [duration, setDuration] = useState("60");

  const intern = activeAll.find(i=>i.id===selectedId);

  const saveSession = () => {
    if(!intern||!note.trim()) return;
    const session = {
      date: TODAY(), type: sessionType,
      duration: `${duration} min`, notes: note.trim(), author:"Alyson"
    };
    // Credit hours to supervisor's hourLog using current category IDs
    const hrs = Math.round((Number(duration)/60)*10)/10;
    const isGroup = sessionType.toLowerCase().includes("group");
    const catId = isGroup ? "group_supervision" : "individual_supervision";
    const catLabel = isGroup ? "Group Supervision" : "Individual Supervision";
    const existingLog = intern.hourLog||[];
    const existingEntry = existingLog.find(e=>e.category===catId);
    const newLog = existingEntry
      ? existingLog.map(e=>e.category===catId?{...e,hours:Math.round((e.hours+hrs)*10)/10}:e)
      : [...existingLog,{category:catId,label:catLabel,type:"direct",hours:hrs}];
    const newTotal = newLog.reduce((s,e)=>s+e.hours,0);
    onUpdateIntern({...intern,
      sessions:[session,...(intern.sessions||[])],
      hourLog:newLog,
      hoursCompleted: Math.round(newTotal),
    });
    onClose();
  };

  const sendReminder = () => {
    setSent(true);
    setTimeout(()=>{ onClose(); }, 1400);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const doc = { name:file.name, date:TODAY(), type:"Document", uploadedBy:"supervisor", dataUrl:ev.target.result, mime:file.type };
      onUpdateIntern({...intern, documents:[doc,...(intern.documents||[])]});
      setUploaded(file.name);
    };
    reader.readAsDataURL(file);
  };

  const iStyle = {width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"};

  const InternPicker = () => <div style={{marginBottom:14}}>
    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Supervisee</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {activeAll.map(i=><button key={i.id} onClick={()=>setSelectedId(i.id)}
        style={{background:selectedId===i.id?t.accentLight:t.surfaceAlt,color:selectedId===i.id?t.accentText:t.muted,border:`1px solid ${selectedId===i.id?t.accentMid:t.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
        <Avatar initials={i.initials} size={18} T={t}/>{dn(i).split(" ")[0]}
      </button>)}
    </div>
  </div>;

  const titles = {
    logsession: "Log Individual Session",
    loggroup:   "Log Group Session",
    payment:    "Send Payment Reminder",
    upload:     "Upload Document",
  };

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,padding:"26px 30px",width:480,maxHeight:"85vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div style={{fontSize:18,color:t.text,fontWeight:500}}>{titles[action]}</div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.faint}}>✕</button>
      </div>

      {/* Log Individual Session */}
      {action==="logsession"&&<div>
        <InternPicker/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Category</div>
            <select value={sessionType} onChange={e=>setSessionType(e.target.value)} style={{...iStyle,cursor:"pointer"}}>
              <optgroup label="Direct">
                <option value="Individual Supervision">Individual Supervision</option>
                <option value="Group Supervision">Group Supervision</option>
                <option value="Triadic Supervision">Triadic Supervision</option>
                <option value="Live Supervision">Live Supervision</option>
                <option value="Phone / Telehealth">Phone / Telehealth</option>
              </optgroup>
              <optgroup label="Indirect">
                <option value="Case Consultation">Case Consultation</option>
                <option value="Report Writing">Report Writing</option>
                <option value="Administrative Tasks">Administrative Tasks</option>
                <option value="Training / Didactic">Training / Didactic</option>
              </optgroup>
            </select>
          </div>
          <div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Duration (min)</div>
            <select value={duration} onChange={e=>setDuration(e.target.value)} style={{...iStyle,cursor:"pointer"}}>
              {["30","45","60","75","90","120"].map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Session notes</div>
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What was covered in this session?" rows={4}
            style={{...iStyle,resize:"vertical"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn T={t} onClick={saveSession} style={{flex:1}}>Save session</Btn>
          <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
        </div>
      </div>}

      {/* Log Group Session */}
      {action==="loggroup"&&<div>
        {groups.filter(g=>g.id).length===0
          ? <div style={{textAlign:"center",padding:"20px 0",color:t.muted,fontSize:14}}>No groups yet — create one in the Groups page first.</div>
          : <div style={{fontSize:13,color:t.muted}}>Go to the <strong style={{color:t.text}}>Groups</strong> page to log a group session — it lets you take attendance and charge members in one step.</div>}
        <div style={{marginTop:16}}>
          <Btn T={t} variant="secondary" onClick={onClose}>Close</Btn>
        </div>
      </div>}

      {/* Send Payment Reminder */}
      {action==="payment"&&<div>
        {sent
          ? <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:32,marginBottom:10}}>✅</div>
              <div style={{fontSize:15,color:t.text,fontWeight:500}}>Reminder sent!</div>
            </div>
          : <div>
              <InternPicker/>
              <div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px",marginBottom:14,fontSize:13,color:t.muted,lineHeight:1.6}}>
                A payment reminder will be sent to <strong style={{color:t.text}}>{intern?dn(intern):"—"}</strong>'s email on file. They'll see the outstanding balance and a link to pay.
              </div>
              {intern&&intern.payments?.some(p=>p.status==="overdue")
                ? <div style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:t.accentText}}>
                    Overdue: ${intern.payments.filter(p=>p.status==="overdue").reduce((s,p)=>s+(p.amount||0),0)}
                  </div>
                : <div style={{fontSize:13,color:t.muted,marginBottom:14}}>No overdue balance on file — reminder will be a general follow-up.</div>}
              <div style={{display:"flex",gap:10}}>
                <Btn T={t} onClick={sendReminder} style={{flex:1}}>Send reminder</Btn>
                <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
              </div>
            </div>}
      </div>}

      {/* Upload Document */}
      {action==="upload"&&<div>
        <InternPicker/>
        {uploaded
          ? <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:32,marginBottom:8}}>📄</div>
              <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:4}}>Uploaded!</div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",marginBottom:16}}>{uploaded}</div>
              <Btn T={t} variant="secondary" onClick={onClose}>Done</Btn>
            </div>
          : <div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Choose file</div>
              <label style={{display:"block",background:t.surfaceAlt,border:`2px dashed ${t.border}`,borderRadius:10,padding:"28px",textAlign:"center",cursor:"pointer",marginBottom:14,transition:"border-color 0.15s"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=t.accentMid}
                onMouseLeave={e=>e.currentTarget.style.borderColor=t.border}>
                <input type="file" onChange={handleUpload} style={{display:"none"}} disabled={!intern}/>
                <div style={{fontSize:24,marginBottom:8}}>📁</div>
                <div style={{fontSize:13,color:t.muted}}>{intern?"Click to choose a file":"Select a supervisee first"}</div>
                <div style={{fontSize:11,color:t.faint,marginTop:4}}>PDF, Word, image, or any document</div>
              </label>
              <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
            </div>}
      </div>}
    </div>
  </div>;
}

function AISessionModal({intern,groupContext,onSave,onClose,T}) {
  const t=T||THEMES.sage;
  const [step,setStep]=useState("input");
  const [form,setForm]=useState({
    date: TODAY(),
    duration: "60",
    sessionType: groupContext ? "Group Supervision" : "Individual Supervision",
    summary:"",
    bullets:"",
  });
  const [result,setResult]=useState("");
  const [editing,setEditing]=useState(false);
  const [error,setError]=useState("");
  const apiKey = window.__SUPTRACK_API_KEY||"";

  const internName = intern ? (intern.preferredName || intern.name.split(" ")[0]) : "";
  const fullName   = intern ? intern.name : groupContext?.name || "Group";

  const generate = async () => {
    if (!form.summary.trim()) { setError("Please enter at least a brief summary."); return; }
    if (!apiKey) { setError("No API key set — go to ✦ Consult AI or ✦ Supervision Lab and click 'Set API key' first."); return; }
    setError("");
    setStep("generating");

    const bulletList = form.bullets.trim()
      ? form.bullets.split("\n").filter(b=>b.trim()).map(b=>`- ${b.trim()}`).join("\n")
      : "";

    const prompt = `You are helping a licensed clinical supervisor write a professional supervision session note. Write a polished, structured clinical supervision note based on the following input.

Session details:
- Supervisee: ${fullName}${intern?.credential ? ` (${intern.credential})` : ""}
- Session type: ${form.sessionType} supervision
- Date: ${form.date}
- Duration: ${form.duration} minutes
- Supervisor's summary: ${form.summary}
${bulletList ? `- Key points/themes:\n${bulletList}` : ""}

Write a professional supervision note in third person (referring to the supervisee by their last name or "the supervisee"). The note should:
1. Open with a brief session overview sentence
2. Cover clinical content discussed (cases, interventions, presenting concerns)
3. Note any supervisory interventions, guidance given, or skills addressed
4. Include a brief closing statement about next steps or follow-up items if relevant

Use professional clinical language appropriate for licensure documentation. Be specific and concrete. Do not invent details not provided — only expand and professionalize what was given. Keep it to 3–5 paragraphs.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",
          max_tokens:1000,
          messages:[{role:"user",content:prompt}]
        })
      });
      const data = await res.json();
      const text = data.content?.filter(c=>c.type==="text").map(c=>c.text).join("") || "";
      if (!text) throw new Error("Empty response");
      setResult(text);
      setStep("result");
    } catch(e) {
      setError(`Generation failed: ${e.message||"Unknown error"}. Check your API key and try again.`);
      setStep("input");
    }
  };

  const save = () => {
    const note = editing ? document.getElementById("ai-note-edit")?.value || result : result;
    const session = {
      date: form.date,
      type: form.sessionType,
      duration: `${form.duration} min`,
      author: "Alyson",
      notes: note,
    };
    // Determine if direct or indirect from session type
    const directTypes = ["Individual Supervision","Group Supervision","Triadic Supervision","Live Supervision","Phone / Telehealth","Group"];
    const isDirect = directTypes.some(d=>form.sessionType.includes(d.split(" ")[0]));
    const isGroup = form.sessionType.toLowerCase().includes("group");
    const hrs = Math.round((Number(form.duration)/60)*10)/10;
    const catId = isGroup ? "group_supervision" : "individual_supervision";
    const catLabel = isGroup ? "Group Supervision" : "Individual Supervision";
    const catType = "direct";
    // Only credit hourLog if this is for an individual intern (not group)
    if(intern) {
      const existingLog = intern.hourLog||[];
      const existingEntry = existingLog.find(e=>e.category===catId);
      const newLog = existingEntry
        ? existingLog.map(e=>e.category===catId?{...e,hours:Math.round((e.hours+hrs)*10)/10}:e)
        : [...existingLog,{category:catId,label:catLabel,type:catType,hours:hrs}];
      const newTotal = newLog.reduce((s,e)=>s+e.hours,0);
      onSave({...session,_hourLog:newLog,_newTotal:Math.round(newTotal)});
    } else {
      onSave(session);
    }
    onClose();
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.35)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={onClose}>
      <div style={{background:t.surface,borderRadius:18,padding:"28px 30px",width:620,maxHeight:"88vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:3,display:"flex",alignItems:"center",gap:10}}>
              ✦ AI Session Note
              <span style={{fontSize:11,color:t.accentText,background:t.accentLight,borderRadius:4,padding:"2px 8px",fontFamily:"'DM Mono',monospace",fontWeight:500}}>AI-assisted</span>
            </div>
            <div style={{fontSize:13,color:t.muted}}>{fullName} · {form.sessionType} supervision</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.muted,padding:4}}>✕</button>
        </div>

        {step==="input" && <>
          {/* Form */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Date</div>
              <input value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}
                style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Duration (min)</div>
              <input value={form.duration} onChange={e=>setForm(p=>({...p,duration:e.target.value}))}
                style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
            <div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Category</div>
              <select value={form.sessionType} onChange={e=>setForm(p=>({...p,sessionType:e.target.value}))}
                style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.surface,outline:"none"}}>
                <optgroup label="Direct">
                  <option value="Individual Supervision">Individual Supervision</option>
                  <option value="Group Supervision">Group Supervision</option>
                  <option value="Triadic Supervision">Triadic Supervision</option>
                  <option value="Live Supervision">Live Supervision</option>
                  <option value="Phone / Telehealth">Phone / Telehealth</option>
                </optgroup>
                <optgroup label="Indirect">
                  <option value="Case Consultation">Case Consultation</option>
                  <option value="Report Writing">Report Writing</option>
                  <option value="Administrative Tasks">Administrative Tasks</option>
                  <option value="Training / Didactic">Training / Didactic</option>
                </optgroup>
              </select>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>What happened in supervision? <span style={{color:t.faint}}>(rough notes, your own words)</span></div>
            <textarea value={form.summary} onChange={e=>setForm(p=>({...p,summary:e.target.value}))} placeholder={`e.g. Discussed ${internName}'s trauma client, safety planning came up. Reviewed MI skills. ${internName} struggling a bit with countertransference. Talked through a dual relationship concern.`}
              style={{width:"100%",minHeight:100,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.6}}/>
          </div>

          <div style={{marginBottom:20}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>Key points <span style={{color:t.faint}}>(optional — one per line)</span></div>
            <textarea value={form.bullets} onChange={e=>setForm(p=>({...p,bullets:e.target.value}))} placeholder={"Reviewed safety plan for C-0055\nAddressed documentation lag\nAssigned: read chapter on DBT Stage 1"}
              style={{width:"100%",minHeight:80,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.7}}/>
          </div>

          {error && <div style={{background:S.redLight,border:`1px solid #E8C5C5`,borderRadius:8,padding:"10px 14px",fontSize:13,color:S.red,marginBottom:14}}>{error}</div>}

          <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"11px 14px",fontSize:13,color:t.accentText,marginBottom:20}}>
            The AI will write a professional supervision note from your rough notes. You'll be able to edit it before saving.
          </div>

          <div style={{display:"flex",justifyContent:"flex-end",gap:10}}>
            <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
            <Btn T={t} onClick={generate}>✦ Generate note</Btn>
          </div>
        </>}

        {step==="generating" && (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"48px 0",gap:16}}>
            <div style={{width:40,height:40,border:`3px solid ${t.accentMid}`,borderTop:`3px solid ${t.accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
            <div style={{fontSize:14,color:t.muted}}>Writing your supervision note…</div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {step==="result" && <>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Generated note — review and edit as needed</div>
            <div style={{display:"flex",gap:8}}>
              <Btn T={t} variant="secondary" small onClick={()=>{setStep("input");setEditing(false);}}>← Edit inputs</Btn>
              <Btn T={t} variant="secondary" small onClick={generate}>↻ Regenerate</Btn>
              {!editing && <Btn T={t} variant="soft" small onClick={()=>setEditing(true)}>Edit note</Btn>}
            </div>
          </div>

          {editing
            ? <textarea id="ai-note-edit" defaultValue={result}
                style={{width:"100%",minHeight:280,border:`1px solid ${t.accentMid}`,borderRadius:12,padding:"16px 18px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.8}}/>
            : <div style={{background:t.surfaceAlt,borderRadius:12,padding:"18px 20px",fontSize:14,color:t.text,lineHeight:1.8,whiteSpace:"pre-wrap",minHeight:180,border:`1px solid ${t.border}`}}>{result}</div>
          }

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:16,paddingTop:14,borderTop:`1px solid ${t.borderLight}`}}>
            <div style={{fontSize:12,color:t.muted}}>Will be saved as {form.sessionType} session · {form.date} · {form.duration} min</div>
            <div style={{display:"flex",gap:10}}>
              <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
              <Btn T={t} onClick={save}>Save to session log</Btn>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}


// ── Hours category system ──────────────────────────────────────────────────
// Supervisor side: ONLY supervision hours (auto-populated from session notes)
const SUP_CATEGORIES = [
  { id:"individual_supervision", label:"Individual Supervision", type:"direct",   note:"Primary + Secondary" },
  { id:"group_supervision",      label:"Group Supervision",      type:"direct",   note:"Logged via Groups tab" },
];

// Intern side: their own clinical hours (matches NV BOE Form #1 lines 2–6)
// Disciplines can customize, but these are the standard NV MFT/LPC defaults
const INTERN_CATEGORIES = [
  // Supervision received (Line 1 on the BOE form — intern's side)
  { id:"primary_supervision_received",   label:"Individual Supervision — Primary",   type:"direct",   min:300,  max:null, note:"From your primary supervisor" },
  { id:"secondary_supervision_received", label:"Individual Supervision — Secondary", type:"direct",   min:null, max:null, note:"From your secondary supervisor (if applicable)" },
  { id:"group_supervision_received",     label:"Group Supervision Received",          type:"direct",   min:null, max:null, note:"Group supervision sessions attended" },
  // Clinical hours (Lines 2–6 on the BOE form)
  { id:"mft_clients",         label:"Therapy with Clients (Individual)",  type:"direct",   min:1500, max:null, note:"Individual client sessions" },
  { id:"group_therapy",       label:"Group Therapy (with Clients)",        type:"direct",   min:null, max:600,  note:"Max 600 hrs" },
  { id:"personal_therapy",    label:"Personal Therapy",                    type:"indirect", min:null, max:150,  note:"Max 150 hrs" },
  { id:"documented_teaching", label:"Documented Teaching / Workshops",     type:"indirect", min:null, max:200,  note:"Parent/family ed, workshops" },
  { id:"additional_training", label:"Additional Training / Graduate Work", type:"indirect", min:null, max:200,  note:"Approved workshops, grad coursework" },
];

// Legacy — kept for backward compat with existing hourLog entries
const DEFAULT_CATEGORIES = INTERN_CATEGORIES;
const CATEGORY_PRESETS   = INTERN_CATEGORIES;

const sumHours = (log) => log.reduce((s,e)=>s+e.hours,0);
const directHours   = (log) => log.filter(e=>e.type==="direct").reduce((s,e)=>s+e.hours,0);
const indirectHours = (log) => log.filter(e=>e.type==="indirect").reduce((s,e)=>s+e.hours,0);

// ── HoursBreakdown (supervisor view — supervision hours only) ─────────────
function HoursBreakdown({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const [tab,setTab]=useState("supervision");
  const [expandedPeriod,setExpandedPeriod]=useState(null);
  const sessions = intern.sessions||[];

  const parseDuration=(dur)=>{
    if(!dur) return 1;
    const n=parseFloat(dur);
    if(typeof dur==="string"&&dur.includes("min")) return Math.round(n/60*10)/10;
    return n;
  };

  const indivSessions = sessions.filter(s=>!s.type?.toLowerCase().includes("group"));
  const groupSessions = sessions.filter(s=>s.type?.toLowerCase().includes("group"));
  const indivHrs  = Math.round(indivSessions.reduce((s,e)=>s+parseDuration(e.duration),0)*10)/10;
  const groupHrs  = Math.round(groupSessions.reduce((s,e)=>s+parseDuration(e.duration),0)*10)/10;
  const totalSupHrs = Math.round((indivHrs+groupHrs)*10)/10;

  // Intern clinical hours
  const internLog = intern.internHourLog||[];
  const internTotal = internLog.reduce((s,e)=>s+e.hours,0);
  const internDirect = internLog.filter(e=>e.type==="direct").reduce((s,e)=>s+e.hours,0);
  const internIndirect = internLog.filter(e=>e.type==="indirect").reduce((s,e)=>s+e.hours,0);

  const TABS=[["supervision","Supervision (My Log)"],["intern","Intern's Full Log"],["sessions","Session Notes"],["adjust","Adjust"]];

  const downloadCSV=()=>{
    const rows=[["Session Date","Type","Duration","Notes"],...sessions.map(s=>[s.date,s.type||"Individual Supervision",s.duration||"",`"${(s.notes||"").replace(/"/g,'\\"')}"`])];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${intern.name.replace(/\s+/g,"_")}_sessions.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      <StatCard T={t} label="Supervision logged" value={totalSupHrs} color={t.accent} sub="hrs by you"/>
      <StatCard T={t} label="Individual sup." value={indivHrs} color={t.accent}/>
      <StatCard T={t} label="Group sup." value={groupHrs}/>
      <StatCard T={t} label="Intern clinical total" value={internTotal} sub="self-reported"/>
    </div>

    <div style={{display:"flex",gap:0,borderBottom:`1px solid ${t.border}`}}>
      {TABS.map(([id,label])=>(
        <button key={id} onClick={()=>setTab(id)}
          style={{background:"none",border:"none",borderBottom:tab===id?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 16px",cursor:"pointer",fontSize:13,color:tab===id?t.accent:t.muted,fontFamily:"inherit",fontWeight:tab===id?500:400,marginBottom:-1,transition:"all 0.15s"}}>
          {label}
        </button>
      ))}
    </div>

    {/* ── My Supervision Log ── */}
    {tab==="supervision"&&<div>
      <div style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:t.accentText,lineHeight:1.6,marginBottom:14}}>
        ✦ These hours are <strong>auto-calculated from your logged session notes</strong>. Switch to "Intern's Full Log" to see everything {dn(intern)} is tracking.
      </div>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",background:t.surfaceAlt,padding:"10px 18px",gap:8}}>
          {["Supervision type","Sessions","Hours"].map(h=>(
            <div key={h} style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
          ))}
        </div>
        {[
          {label:"Individual Supervision",note:"Direct hours · auto from session notes",sessions:indivSessions,hrs:indivHrs},
          {label:"Group Supervision",note:"Direct hours · auto from group sessions",sessions:groupSessions,hrs:groupHrs},
        ].map((row,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"14px 18px",gap:8,borderTop:`1px solid ${t.borderLight}`,alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{row.label}</div>
              <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:2}}>{row.note}</div>
            </div>
            <div style={{fontSize:14,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{row.sessions.length}</div>
            <div style={{fontSize:16,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{row.hrs}</div>
          </div>
        ))}
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",padding:"13px 18px",gap:8,borderTop:`2px solid ${t.border}`,background:t.surfaceAlt}}>
          <div style={{fontSize:14,color:t.text,fontWeight:700}}>Total supervision hours</div>
          <div style={{fontSize:14,color:t.muted,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{sessions.length}</div>
          <div style={{fontSize:18,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{totalSupHrs}</div>
        </div>
      </div>

      {/* Six-month period history — clickable */}
      {intern.supervisorHoursLog?.length>0&&<div style={{marginTop:16}}>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>
          Six-month period history <span style={{fontSize:10,color:t.faint,textTransform:"none",letterSpacing:"normal"}}>(click to expand)</span>
        </div>
        {intern.supervisorHoursLog.map((row,i)=>(
          <div key={i} style={{marginBottom:8}}>
            <div onClick={()=>setExpandedPeriod(expandedPeriod===i?null:i)}
              style={{background:t.surface,border:`1px solid ${expandedPeriod===i?t.accentMid:t.border}`,borderRadius:expandedPeriod===i?"10px 10px 0 0":10,padding:"12px 16px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",transition:"all 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=t.accentMid}
              onMouseLeave={e=>{if(expandedPeriod!==i)e.currentTarget.style.borderColor=t.border;}}>
              <span style={{fontSize:12,color:t.faint,transition:"transform 0.2s",display:"inline-block",transform:expandedPeriod===i?"rotate(90deg)":"rotate(0deg)"}}>›</span>
              <div style={{fontSize:13,color:t.text,fontWeight:500,flex:1}}>{row.period}</div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Indiv: <strong style={{color:t.accent}}>{row.individual}</strong></div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Group: <strong style={{color:t.accent}}>{row.group}</strong></div>
              <div style={{fontSize:13,color:t.accentText,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{row.individual+row.group} hrs</div>
            </div>
            {expandedPeriod===i&&<div style={{background:t.surfaceAlt,border:`1px solid ${t.accentMid}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:"14px 16px"}}>
              {/* Session breakdown for this period */}
              {sessions.length===0
                ? <div style={{fontSize:13,color:t.faint,padding:"8px 0"}}>No individual session records available for this period.</div>
                : <div>
                    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Sessions logged this period</div>
                    {sessions.map((s,si)=>(
                      <div key={si} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:8,marginBottom:4,background:t.surface}}>
                        <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",minWidth:90}}>{s.date}</span>
                        <Badge color={t.accentText} bg={t.accentLight}>{s.type||"Individual"}</Badge>
                        <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{s.duration}</span>
                        <span style={{fontSize:12,color:t.faint,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.notes}</span>
                      </div>
                    ))}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12}}>
                      <div style={{background:t.surface,borderRadius:8,padding:"10px 14px",textAlign:"center"}}>
                        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Individual</div>
                        <div style={{fontSize:20,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{row.individual} hrs</div>
                      </div>
                      <div style={{background:t.surface,borderRadius:8,padding:"10px 14px",textAlign:"center"}}>
                        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Group</div>
                        <div style={{fontSize:20,color:t.muted,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{row.group} hrs</div>
                      </div>
                    </div>
                  </div>}
            </div>}
          </div>
        ))}
      </div>}
    </div>}

    {/* ── Intern's Full Log ── */}
    {tab==="intern"&&<div>
      <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:t.muted,marginBottom:14,lineHeight:1.6}}>
        This is {dn(intern)}'s self-reported clinical log. These are the hours they are tracking for their licensing board — supervision received, client contact, training, etc.
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
        <StatCard T={t} label="Total hours" value={internTotal} color={t.accent}/>
        <StatCard T={t} label="Direct" value={internDirect} color={t.accent}/>
        <StatCard T={t} label="Indirect" value={internIndirect}/>
      </div>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr",background:t.surfaceAlt,padding:"10px 18px",gap:8}}>
          {["Category","Type","Hours","Limit"].map(h=>(
            <div key={h} style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
          ))}
        </div>
        {INTERN_CATEGORIES.map(cat=>{
          const entry=internLog.find(e=>e.category===cat.id);
          const hrs=entry?.hours||0;
          const atMax=cat.max&&hrs>=cat.max;
          const metMin=cat.min&&hrs>=cat.min;
          return <div key={cat.id} style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr",padding:"12px 18px",gap:8,borderTop:`1px solid ${t.borderLight}`,alignItems:"center",background:atMax?`${S.amber}08`:"transparent"}}>
            <div>
              <div style={{fontSize:13,color:t.text,fontWeight:500}}>{cat.label}</div>
              {cat.note&&<div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:1}}>{cat.note}</div>}
            </div>
            <Badge color={cat.type==="direct"?t.accentText:t.muted} bg={cat.type==="direct"?t.accentLight:t.surfaceAlt}>{cat.type}</Badge>
            <div style={{fontSize:16,color:hrs>0?t.accent:t.faint,fontFamily:"'DM Mono',monospace",fontWeight:hrs>0?700:400}}>{hrs}</div>
            <div style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>
              {cat.min&&<div style={{color:metMin?S.green:t.faint}}>min {cat.min}{metMin?" ✓":""}</div>}
              {cat.max&&<div style={{color:atMax?S.amber:t.faint}}>max {cat.max}{atMax?" ⚠":""}</div>}
            </div>
          </div>;
        })}
        <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr",padding:"13px 18px",gap:8,borderTop:`2px solid ${t.border}`,background:t.surfaceAlt}}>
          <div style={{fontSize:14,color:t.text,fontWeight:700}}>Grand total</div>
          <div/>
          <div style={{fontSize:18,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{internTotal}</div>
          <div/>
        </div>
      </div>
    </div>}

    {/* ── Session Notes ── */}
    {tab==="sessions"&&<div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{fontSize:13,color:t.muted}}>{sessions.length} session{sessions.length!==1?"s":""} logged</div>
        {sessions.length>0&&<button onClick={downloadCSV}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          ⬇ Download (.csv)
        </button>}
      </div>
      {sessions.length===0
        ? <div style={{fontSize:13,color:t.faint,padding:"24px 0",textAlign:"center"}}>No sessions logged yet.</div>
        : sessions.map((s,i)=>(
            <div key={i} style={{background:t.surface,border:`1px solid ${t.border}`,borderLeft:`3px solid ${t.accent}`,borderRadius:10,padding:"12px 16px",marginBottom:8}}>
              <div style={{display:"flex",gap:8,marginBottom:s.notes?6:0,alignItems:"center",flexWrap:"wrap"}}>
                <Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge>
                <Badge color={t.accentText} bg={t.accentLight}>{s.type||"Individual Supervision"}</Badge>
                {s.duration&&<Badge color={t.muted} bg={t.surfaceAlt}>{s.duration}</Badge>}
                <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{s.author}</span>
              </div>
              {s.notes&&<p style={{fontSize:13,color:t.text,margin:0,lineHeight:1.6}}>{s.notes}</p>}
            </div>
          ))}
    </div>}

    {/* ── Adjust ── */}
    {tab==="adjust"&&<div>
      <div style={{background:S.amberLight,border:"1px solid #E8C98A",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#7A5A00",lineHeight:1.6}}>
        ⚠ <strong>For SupTrack data errors only.</strong> Supervision hours are auto-calculated from session notes. Only adjust here if a session was logged with the wrong duration. If {dn(intern)} submitted incorrect hours to their board, that must be corrected directly with the board.
      </div>
      <InternHoursEditor key={`sup-adj-${intern.id}`} T={t} intern={intern} onUpdate={onUpdateIntern} supervisorMode={true}/>
    </div>}
  </div>;
}
// ── InternHoursEditor (intern portal — can log & add categories) ───────────
function InternHoursEditor({intern,onUpdate,T,supervisorMode}) {
  const t=T||THEMES.sage;
  const log = intern.internHourLog || [];
  const customCats = intern.customHourCategories || [];
  const [addingCat,setAddingCat]=useState(false);
  const [selectedPreset,setSelectedPreset]=useState("");
  const [newCatName,setNewCatName]=useState("");
  const [newCatType,setNewCatType]=useState("direct");
  const [editing,setEditing]=useState(null);
  const [showSupervisorNote,setShowSupervisorNote]=useState(false);

  const total    = sumHours(log);
  const direct   = directHours(log);
  const indirect = indirectHours(log);

  // Sessions logged by supervisor
  const sessionCount = intern.sessions?.length||0;
  const groupSessionCount = intern.groupIds?.reduce((s,gid)=>s,0)||0;

  const allCats = [
    ...INTERN_CATEGORIES,
    ...customCats.map(c=>typeof c==="string"?{id:`custom_${c}`,label:c,type:"direct"}:c),
  ];

  const fullLog = allCats.map(cat=>{
    const existing=log.find(e=>e.category===cat.id||e.label===cat.label);
    return existing||{id:`new_${cat.id}`,category:cat.id,label:cat.label,type:cat.type,hours:0};
  });

  const updateHours=(catId,val)=>{
    const n=Math.max(0,Number(val)||0);
    const updated=fullLog.map(e=>(e.category===catId||e.label===allCats.find(c=>c.id===catId)?.label)?{...e,hours:n}:e);
    const newTotal=sumHours(updated);
    onUpdate&&onUpdate({...intern,internHourLog:updated,customHourCategories:customCats,hoursCompleted:newTotal});
  };

  const addPreset=()=>{
    if(!selectedPreset) return;
    const preset=CATEGORY_PRESETS.find(p=>p.id===selectedPreset);
    if(!preset) return;
    // Don't add duplicates
    if(allCats.some(c=>c.id===preset.id)) return;
    const nc=[...customCats,{id:preset.id,label:preset.label,type:preset.type}];
    setSelectedPreset("");
    onUpdate&&onUpdate({...intern,customHourCategories:nc});
  };

  const addCustom=()=>{
    if(!newCatName.trim()) return;
    const nc=[...customCats,{id:`custom_${Date.now()}`,label:newCatName.trim(),type:newCatType}];
    setNewCatName("");setAddingCat(false);
    onUpdate&&onUpdate({...intern,customHourCategories:nc});
  };

  const removeCustom=(id)=>{
    const nc=customCats.filter(c=>(typeof c==="string"?`custom_${c}`:c.id)!==id);
    const ul=log.filter(e=>e.category!==id);
    onUpdate&&onUpdate({...intern,internHourLog:ul,customHourCategories:nc});
  };

  const downloadCSV=()=>{
    const rows=[["Category","Type","Hours"],...fullLog.map(e=>[e.label,e.type,e.hours]),["","Grand Total",total],["","Direct",direct],["","Indirect",indirect]];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${intern.name.replace(/\s+/g,"_")}_hours.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  const availablePresets=CATEGORY_PRESETS.filter(p=>!allCats.some(c=>c.id===p.id));

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>

    {/* Summary cards */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      <StatCard T={t} label="Clinical hours total" value={total} color={t.accent}/>
      <StatCard T={t} label="Direct (client contact)" value={direct} color={t.accent}/>
      <StatCard T={t} label="Indirect" value={indirect}/>
      <StatCard T={t} label="Supervision sessions" value={sessionCount} sub="logged by supervisor"/>
    </div>

    {/* BOE context note */}
    {!supervisorMode&&<div style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:t.accentText,lineHeight:1.6}}>
      Log your hours below — supervision received (primary, secondary, group) and all your clinical hours. Your supervisor's session notes automatically credit your supervision rows, but you can update them here too if anything is missing.
    </div>}

    {/* Supervisor adjustment note */}
    {supervisorMode&&<div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontSize:13,color:t.accentText,lineHeight:1.5}}>
        <strong>Supervisor view:</strong> You can adjust hours to correct entry errors. Changes are logged with your name for accountability.
      </div>
    </div>}

    {/* Progress */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:12}}>Progress toward {intern.licenseGoal}</div>
      <PBar value={Math.min(total,intern.hoursTotal)} total={intern.hoursTotal} T={t}/>
    </div>

    {/* Editable breakdown */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr 40px",background:t.surfaceAlt,padding:"10px 18px",gap:8}}>
        {["Category","Type","Hours","Limit",""].map(h=><div key={h} style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>)}
      </div>
      {allCats.map((cat)=>{
        const entry=fullLog.find(e=>e.category===cat.id||e.label===cat.label);
        const hrs=entry?.hours||0;
        const isCustom=customCats.some(c=>(typeof c==="string"?`custom_${c}`:c.id)===cat.id||c===cat.label);
        const atMax = cat.max && hrs>=cat.max;
        const metMin = cat.min && hrs>=cat.min;
        return <div key={cat.id} style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr 40px",padding:"10px 18px",gap:8,borderTop:`1px solid ${t.borderLight}`,alignItems:"center",background:atMax?`${S.amber}10`:"transparent"}}>
          <div>
            <div style={{fontSize:13,color:t.text,fontWeight:500}}>{cat.label}</div>
            {cat.note&&<div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:1}}>{cat.note}</div>}
          </div>
          <div><Badge color={cat.type==="direct"?t.accentText:t.muted} bg={cat.type==="direct"?t.accentLight:t.surfaceAlt}>{cat.type}</Badge></div>
          <div>
            {editing===cat.id
              ? <input type="number" min="0" defaultValue={hrs} autoFocus
                  onBlur={e=>{updateHours(cat.id,e.target.value);setEditing(null);}}
                  onKeyDown={e=>{if(e.key==="Enter"){updateHours(cat.id,e.target.value);setEditing(null);}if(e.key==="Escape")setEditing(null);}}
                  style={{width:80,border:`1px solid ${t.accentMid}`,borderRadius:6,padding:"4px 8px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.accentLight,outline:"none"}}/>
              : <button onClick={()=>setEditing(cat.id)} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:14,color:t.text,fontFamily:"'DM Mono',monospace",textAlign:"left",minWidth:60}}>{hrs} <span style={{fontSize:11,color:t.faint}}>✎</span></button>}
          </div>
          <div style={{fontSize:11,fontFamily:"'DM Mono',monospace"}}>
            {cat.min&&<div style={{color:metMin?S.green:t.faint}}>min {cat.min}{metMin?" ✓":""}</div>}
            {cat.max&&<div style={{color:atMax?S.amber:t.faint}}>max {cat.max}{atMax?" ⚠":""}</div>}
          </div>
          <div>{isCustom&&<button onClick={()=>removeCustom(cat.id)} title="Remove" style={{background:"none",border:"none",cursor:"pointer",color:t.faint,fontSize:14,padding:0}}>✕</button>}</div>
        </div>;
      })}
      <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr 40px",padding:"11px 18px",gap:8,borderTop:`2px solid ${t.border}`,background:t.surfaceAlt}}>
        <div style={{fontSize:13,color:t.text,fontWeight:600}}>Direct (client contact)</div><div/>
        <div style={{fontSize:13,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{direct}</div><div/><div/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr 40px",padding:"11px 18px",gap:8,borderTop:`1px solid ${t.borderLight}`,background:t.surfaceAlt}}>
        <div style={{fontSize:13,color:t.text,fontWeight:600}}>Indirect</div><div/>
        <div style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{indirect}</div><div/><div/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2.5fr .7fr 1fr .8fr 40px",padding:"13px 18px",gap:8,borderTop:`2px solid ${t.border}`}}>
        <div style={{fontSize:14,fontWeight:700,color:t.text}}>Grand total</div><div/>
        <div style={{fontSize:14,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{total}</div><div/><div/>
      </div>
    </div>

    {/* Add category — preset dropdown or custom */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 18px"}}>
      <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Add hour category</div>
      {/* Preset picker */}
      {availablePresets.length>0&&<div style={{display:"flex",gap:8,marginBottom:10}}>
        <select value={selectedPreset} onChange={e=>setSelectedPreset(e.target.value)}
          style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:13,color:selectedPreset?t.text:t.muted,background:t.bg,outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
          <option value="">— Choose from standard categories —</option>
          <optgroup label="Direct hours">
            {availablePresets.filter(p=>p.type==="direct").map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
          <optgroup label="Indirect hours">
            {availablePresets.filter(p=>p.type==="indirect").map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
          </optgroup>
        </select>
        <Btn T={t} small onClick={addPreset} disabled={!selectedPreset}>Add</Btn>
      </div>}
      {/* Custom */}
      {!addingCat
        ? <button onClick={()=>setAddingCat(true)} style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:8,padding:"7px 14px",fontSize:12,color:t.faint,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>+ Add custom category</button>
        : <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <input value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Custom category name..." onKeyDown={e=>e.key==="Enter"&&addCustom()}
              style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",minWidth:160}}/>
            {["direct","indirect"].map(type=><button key={type} onClick={()=>setNewCatType(type)}
              style={{background:newCatType===type?t.accentLight:"none",color:newCatType===type?t.accentText:t.muted,border:`1px solid ${newCatType===type?t.accentMid:t.border}`,borderRadius:7,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{type}</button>)}
            <Btn T={t} small onClick={addCustom}>Add</Btn>
            <Btn T={t} variant="secondary" small onClick={()=>{setAddingCat(false);setNewCatName("");}}>Cancel</Btn>
          </div>}
    </div>

    {/* Download */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{fontSize:12,color:t.faint}}>Click any hour value to edit. Changes sync with your supervisor's view.</div>
      <button onClick={downloadCSV}
        style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:6}}>
        ⬇ Download hours (.csv)
      </button>
    </div>
  </div>;
}

// ── Confetti burst component ───────────────────────────────────────────────
function Confetti({active}) {
  const [particles,setParticles]=useState([]);
  React.useEffect(()=>{
    if(!active) return;
    const colors=["#9B6FD4","#C88AC8","#F4A0C0","#F9C4DA","#4DBDBD","#7AD4D4","#B48CE8","#F4A0C0"];
    const p=Array.from({length:80},(_,i)=>({
      id:i, color:colors[i%colors.length],
      x: 30+Math.random()*40, // % from left — spread from center
      vx:(Math.random()-0.5)*14,
      vy:-(8+Math.random()*12),
      rot:Math.random()*360,
      vrot:(Math.random()-0.5)*20,
      size:6+Math.random()*8,
      shape:Math.random()>0.5?"rect":"circle",
    }));
    setParticles(p);
    const id=setTimeout(()=>setParticles([]),3500);
    return ()=>clearTimeout(id);
  },[active]);

  if(!particles.length) return null;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
    {particles.map(p=><ConfettiParticle key={p.id} p={p}/>)}
  </div>;
}

function ConfettiParticle({p}) {
  const [pos,setPos]=useState({x:p.x,y:60,vx:p.vx,vy:p.vy,rot:p.rot,opacity:1});
  React.useEffect(()=>{
    let frame,state={...pos};
    const tick=()=>{
      state={x:state.x+state.vx*0.18,y:state.y+state.vy*0.18,vx:state.vx*0.97,vy:state.vy+0.25,rot:state.rot+p.vrot,opacity:state.y>110?Math.max(0,state.opacity-0.02):state.opacity};
      setPos({...state});
      if(state.opacity>0&&state.y<130) frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[]);
  return <div style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,width:p.size,height:p.shape==="rect"?p.size*0.5:p.size,background:p.color,borderRadius:p.shape==="circle"?"50%":2,transform:`rotate(${pos.rot}deg)`,opacity:pos.opacity,transition:"none"}}/>;
}

// ── Intern Profile ─────────────────────────────────────────────────────────
// ── EmploymentCard — proper component so hooks are at top level ──────────────
// ── EditProfileModal — edit intern's basic info ───────────────────────────────
function EditProfileModal({intern,onSave,onClose,T}) {
  const t=T||THEMES.sage;
  const [form,setForm]=useState({
    name:       intern.name||"",
    preferredName: intern.preferredName||"",
    pronouns:   intern.pronouns||"",
    dob:        intern.dob||"",
    gender:     intern.gender||"",
    race:       intern.race||"",
    ethnicity:  intern.ethnicity||"",
    phone:      intern.phone||"",
    email:      intern.email||"",
    startDate:  intern.startDate||"",
    // Employment
    employer:         intern.employment?.employer||"",
    employerAddress:  intern.employment?.employerAddress||"",
    contactName:      intern.employment?.contactName||"",
    contactTitle:     intern.employment?.contactTitle||"",
    contactPhone:     intern.employment?.contactPhone||"",
    contactEmail:     intern.employment?.contactEmail||"",
    // Credential (supervisor-only fields)
    credential:    intern.credential||"",
    credentialBody:intern.credentialBody||"",
    university:    intern.university||"",
    licenseGoal:   intern.licenseGoal||"",
  });
  const [section,setSection]=useState("personal");
  const [errors,setErrors]=useState({});
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));

  const validate=()=>{
    const e={};
    if(!form.name.trim()) e.name="Required";
    if(form.contactEmail&&!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail="Invalid email";
    return e;
  };

  const save=()=>{
    const e=validate();
    if(Object.keys(e).length){setErrors(e);return;}
    const initials=form.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    onSave({
      ...intern,
      name:form.name.trim(), preferredName:form.preferredName.trim(),
      initials, pronouns:form.pronouns.trim(),
      dob:form.dob, gender:form.gender, race:form.race, ethnicity:form.ethnicity,
      phone:form.phone, email:form.email, startDate:form.startDate,
      credential:form.credential, credentialBody:form.credentialBody,
      university:form.university, licenseGoal:form.licenseGoal,
      employment:{
        employer:form.employer, employerAddress:form.employerAddress,
        contactName:form.contactName, contactTitle:form.contactTitle,
        contactPhone:form.contactPhone, contactEmail:form.contactEmail,
      },
    });
    onClose();
  };

  const inp=(key,placeholder,type="text",required=false)=><div>
    <input type={type} value={form[key]} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
      style={{width:"100%",border:`1px solid ${errors[key]?"#E05050":t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
    {errors[key]&&<div style={{fontSize:10,color:"#E05050",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{errors[key]}</div>}
  </div>;

  const iLabel=(txt)=><div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>{txt}</div>;

  const SECTIONS=[
    {id:"personal",label:"Personal"},
    {id:"demographic",label:"Demographics"},
    {id:"contact",label:"Contact"},
    {id:"employment",label:"Employment"},
    {id:"credential",label:"Credential"},
  ];

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,width:560,maxHeight:"90vh",display:"flex",flexDirection:"column",boxShadow:"0 24px 64px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
      {/* Header */}
      <div style={{padding:"20px 24px 0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{fontSize:18,color:t.text,fontWeight:500}}>Edit profile — {intern.preferredName||intern.name.split(" ")[0]}</div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.faint,padding:4}}>✕</button>
      </div>

      {/* Section tabs */}
      <div style={{display:"flex",gap:0,padding:"12px 24px 0",borderBottom:`1px solid ${t.border}`,flexShrink:0,overflowX:"auto"}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setSection(s.id)}
            style={{background:"none",border:"none",borderBottom:section===s.id?`2px solid ${t.accent}`:"2px solid transparent",padding:"6px 14px",cursor:"pointer",fontSize:13,color:section===s.id?t.accent:t.muted,fontFamily:"inherit",fontWeight:section===s.id?500:400,marginBottom:-1,whiteSpace:"nowrap"}}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:"auto",padding:"18px 24px"}}>

        {section==="personal"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{iLabel("Full legal name *")}{inp("name","e.g. Marissa Holloway","text",true)}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{iLabel("Preferred name")}{inp("preferredName","e.g. Riss")}</div>
            <div>{iLabel("Pronouns")}{inp("pronouns","e.g. she/her")}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{iLabel("Date of birth")}{inp("dob","","date")}</div>
            <div>{iLabel("Start date")}{inp("startDate","e.g. Mar 2026")}</div>
          </div>
        </div>}

        {section==="demographic"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>
            {iLabel("Gender identity")}
            <select value={form.gender} onChange={e=>set("gender",e.target.value)}
              style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",cursor:"pointer"}}>
              {["","Man","Woman","Nonbinary","Genderqueer","Transgender man","Transgender woman","Gender fluid","Agender","Two-spirit","Prefer not to say","Other"].map(g=><option key={g} value={g}>{g||"— Select —"}</option>)}
            </select>
          </div>
          <div>
            {iLabel("Race")}
            <select value={form.race} onChange={e=>set("race",e.target.value)}
              style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",cursor:"pointer"}}>
              {["","American Indian or Alaska Native","Asian","Black or African American","Native Hawaiian or Pacific Islander","White","Multiracial","Prefer not to say","Other"].map(r=><option key={r} value={r}>{r||"— Select —"}</option>)}
            </select>
          </div>
          <div>
            {iLabel("Ethnicity")}
            <select value={form.ethnicity} onChange={e=>set("ethnicity",e.target.value)}
              style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",cursor:"pointer"}}>
              {["","Hispanic or Latino","Not Hispanic or Latino","Prefer not to say"].map(e=><option key={e} value={e}>{e||"— Select —"}</option>)}
            </select>
          </div>
        </div>}

        {section==="contact"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div>{iLabel("Phone number")}{inp("phone","e.g. 702-555-0100","tel")}</div>
          <div>{iLabel("Email address")}{inp("email","e.g. marissa@email.com","email")}</div>
        </div>}

        {section==="employment"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:12,color:t.muted,marginBottom:4}}>Place of employment & emergency contact</div>
          <div>{iLabel("Employer / Agency *")}{inp("employer","e.g. Quest Counseling")}</div>
          <div>{iLabel("Address (optional)")}{inp("employerAddress","e.g. 123 Main St, Reno NV")}</div>
          <div style={{height:1,background:t.borderLight}}/>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Emergency contact at employer</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{iLabel("Contact name")}{inp("contactName","Full name")}</div>
            <div>{iLabel("Title / Role")}{inp("contactTitle","e.g. Clinical Director")}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{iLabel("Phone *")}{inp("contactPhone","702-555-0100","tel")}</div>
            <div>{iLabel("Email *")}{inp("contactEmail","contact@agency.com","email")}</div>
          </div>
        </div>}

        {section==="credential"&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
          <div style={{background:S.amberLight,border:"1px solid #E8C98A",borderRadius:8,padding:"8px 14px",fontSize:12,color:"#7A5A00"}}>
            ⚠ Credential changes are tracked. Only update these to correct data entry errors — do not change them to modify board records.
          </div>
          <div>{iLabel("Current credential")}{inp("credential","e.g. LPC-Intern")}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>{iLabel("Credentialing body")}{inp("credentialBody","e.g. CACREP")}</div>
            <div>{iLabel("Licensure goal")}{inp("licenseGoal","e.g. LPC")}</div>
          </div>
          {intern.discipline==="student"&&<div>{iLabel("University *")}{inp("university","e.g. University of Nevada, Reno")}</div>}
        </div>}
      </div>

      {/* Footer */}
      <div style={{padding:"14px 24px",borderTop:`1px solid ${t.border}`,display:"flex",justifyContent:"flex-end",gap:10,flexShrink:0}}>
        <Btn T={t} variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn T={t} onClick={save}>✓ Save changes</Btn>
      </div>
    </div>
  </div>;
}

function EmploymentCard({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const emp = intern.employment || {};
  const [editingEmp, setEditingEmp] = useState(false);
  const [form, setForm] = useState({
    employer:       emp.employer||"",
    employerAddress:emp.employerAddress||"",
    contactName:    emp.contactName||"",
    contactTitle:   emp.contactTitle||"",
    contactPhone:   emp.contactPhone||"",
    contactEmail:   emp.contactEmail||"",
  });
  const [errors, setErrors] = useState({});

  // Sync form if intern.employment changes externally
  React.useEffect(()=>{
    const e=intern.employment||{};
    setForm({employer:e.employer||"",employerAddress:e.employerAddress||"",contactName:e.contactName||"",contactTitle:e.contactTitle||"",contactPhone:e.contactPhone||"",contactEmail:e.contactEmail||""});
  },[intern.id]);

  const validate = () => {
    const e = {};
    if(!form.employer.trim())     e.employer="Required";
    if(!form.contactName.trim())  e.contactName="Required";
    if(!form.contactPhone.trim()) e.contactPhone="Required";
    if(!form.contactEmail.trim()) e.contactEmail="Required";
    else if(!/\S+@\S+\.\S+/.test(form.contactEmail)) e.contactEmail="Invalid email";
    return e;
  };

  const save = () => {
    const e = validate();
    if(Object.keys(e).length){setErrors(e);return;}
    onUpdateIntern&&onUpdateIntern({...intern,employment:form});
    setEditingEmp(false);setErrors({});
  };

  const cancel = () => {
    const e=intern.employment||{};
    setForm({employer:e.employer||"",employerAddress:e.employerAddress||"",contactName:e.contactName||"",contactTitle:e.contactTitle||"",contactPhone:e.contactPhone||"",contactEmail:e.contactEmail||""});
    setEditingEmp(false);setErrors({});
  };

  const hasData = emp.employer||emp.contactName;

  const inp = (key,placeholder,type="text") => <div>
    <input type={type} value={form[key]} onChange={ev=>setForm(p=>({...p,[key]:ev.target.value}))} placeholder={placeholder}
      style={{width:"100%",border:`1px solid ${errors[key]?"#E05050":t.border}`,borderRadius:7,padding:"7px 10px",fontSize:12,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
    {errors[key]&&<div style={{fontSize:10,color:"#E05050",marginTop:2,fontFamily:"'DM Mono',monospace"}}>{errors[key]}</div>}
  </div>;

  return <div style={{background:t.surface,border:`1px solid ${!hasData&&intern.status==="active"?t.accentMid:t.border}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>🏢 Employment & Contact</div>
      <div style={{display:"flex",gap:6}}>
        {intern.status==="active"&&<button onClick={()=>editingEmp?save():setEditingEmp(true)}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          {editingEmp?"✓ Save":"✎ Edit"}
        </button>}
        {editingEmp&&<button onClick={cancel}
          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>Cancel</button>}
      </div>
    </div>

    {!hasData&&!editingEmp&&intern.status==="active"&&(
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:13,color:t.muted,marginBottom:8}}>No employment info on file</div>
        <button onClick={()=>setEditingEmp(true)}
          style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"6px 16px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
          + Add employment info
        </button>
        <div style={{fontSize:11,color:t.faint,marginTop:6}}>Phone & email required</div>
      </div>
    )}

    {editingEmp&&<div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>Place of employment</div>
      {inp("employer","Employer / Agency name *")}
      {inp("employerAddress","Address (optional)")}
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginTop:4,marginBottom:2}}>Emergency contact at employer</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {inp("contactName","Contact name *")}
        {inp("contactTitle","Title / Role")}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {inp("contactPhone","Phone *","tel")}
        {inp("contactEmail","Email *","email")}
      </div>
    </div>}

    {hasData&&!editingEmp&&<div style={{display:"flex",flexDirection:"column",gap:7}}>
      {[
        ["Employer",  emp.employer],
        emp.employerAddress?["Address", emp.employerAddress]:null,
        ["Contact",   emp.contactName+(emp.contactTitle?` · ${emp.contactTitle}`:"")],
        ["Phone",     <a key="ph" href={`tel:${emp.contactPhone}`} style={{color:t.accentText,textDecoration:"none",fontFamily:"'DM Mono',monospace",fontSize:12}}>{emp.contactPhone}</a>],
        ["Email",     <a key="em" href={`mailto:${emp.contactEmail}`} style={{color:t.accentText,textDecoration:"none",fontSize:12}}>{emp.contactEmail}</a>],
      ].filter(Boolean).map(([label,val])=>(
        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:7,borderBottom:`1px solid ${t.borderLight}`}}>
          <span style={{fontSize:12,color:t.muted,flexShrink:0}}>{label}</span>
          <span style={{fontSize:12,color:t.text,textAlign:"right",marginLeft:8}}>{val}</span>
        </div>
      ))}
    </div>}
  </div>;
}

// ── InternActionsMenu — proper component so hooks are at top level ───────────
function InternActionsMenu({T,intern,onConsult,onFlagOpen,onLinkOpen,onExportOpen,onShareOpen,onAiSession,onComplete,onEditProfile,onDelete}) {
  const t=T||THEMES.sage;
  const [open,setOpen]=useState(false);
  React.useEffect(()=>{
    const close=()=>setOpen(false);
    document.addEventListener("click",close);
    return ()=>document.removeEventListener("click",close);
  },[]);
  return <div style={{display:"flex",gap:6,alignItems:"center"}}>
    <div style={{position:"relative"}}>
      <button onClick={e=>{e.stopPropagation();setOpen(o=>!o);}}
        style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:15,color:t.muted,lineHeight:1}}>···</button>
      {open&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:200,minWidth:160,padding:"6px 0"}}>
        {[
          {label:"✎ Edit profile",  fn:()=>{onEditProfile&&onEditProfile();setOpen(false);}},
          {label:"🚩 Flags",     fn:()=>{onFlagOpen();setOpen(false);}},
          {label:"🔗 Send link", fn:()=>{onLinkOpen();setOpen(false);}},
          {label:"📤 Export",    fn:()=>{onExportOpen();setOpen(false);}},
          {label:"👥 Share",     fn:()=>{onShareOpen();setOpen(false);}},
        ].map(item=><button key={item.label} onClick={item.fn}
          style={{display:"block",width:"100%",background:"none",border:"none",padding:"9px 16px",cursor:"pointer",fontSize:13,color:t.text,textAlign:"left",fontFamily:"inherit"}}
          onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
          onMouseLeave={e=>e.currentTarget.style.background="none"}>{item.label}</button>)}
        <div style={{borderTop:`1px solid ${t.border}`,margin:"4px 0"}}/>
        <button onClick={()=>{onDelete&&onDelete();setOpen(false);}}
          style={{display:"block",width:"100%",background:"none",border:"none",padding:"9px 16px",cursor:"pointer",fontSize:13,color:S.red,textAlign:"left",fontFamily:"inherit"}}
          onMouseEnter={e=>e.currentTarget.style.background=S.redLight}
          onMouseLeave={e=>e.currentTarget.style.background="none"}>
          🗑 Delete supervisee
        </button>
      </div>}
    </div>
    {intern.status==="active"&&<Btn T={t} variant="soft" small onClick={()=>onConsult&&onConsult(intern)}>✦ Consult AI</Btn>}
    {intern.status==="active"&&<Btn T={t} small onClick={onAiSession}>✦ Log Session</Btn>}
    {intern.status==="active"&&intern.hoursCompleted>=intern.hoursTotal&&(
      <Btn T={t} small onClick={onComplete} style={{background:"linear-gradient(135deg,#4ADE80,#60A5FA)",border:"none",color:"#fff",fontWeight:600}}>
        🎓 Complete
      </Btn>
    )}
  </div>;
}

// ── TagsBox — extracted to comply with Rules of Hooks (no hooks in IIFEs) ─────
function TagsBox({intern,lists,memberLists,t,onUpdateIntern,setLists}) {
  const [tagInput,setTagInput]=useState("");
  const [tagFocused,setTagFocused]=useState(false);

  const addTag=(name)=>{
    const trimmed=name.trim();
    if(!trimmed) return;
    let list=lists.find(l=>l.name.toLowerCase()===trimmed.toLowerCase());
    if(!list){
      const colors=[{c:S.teal,l:S.tealLight},{c:S.purple,l:S.purpleLight},{c:S.amber,l:S.amberLight},{c:S.coral,l:S.coralLight},{c:"#2563EB",l:"#EFF6FF"}];
      const col=colors[lists.length%colors.length];
      list={id:`l${Date.now()}`,name:trimmed,color:col.c,colorLight:col.l};
      setLists&&setLists(p=>[...p,list]);
    }
    if(!(intern.listIds||[]).includes(list.id)){
      onUpdateIntern({...intern,listIds:[...(intern.listIds||[]),list.id]});
    }
    setTagInput("");
  };

  const suggestions=tagInput.trim()
    ? lists.filter(l=>l.name.toLowerCase().includes(tagInput.toLowerCase())&&!(intern.listIds||[]).includes(l.id))
    : lists.filter(l=>!(intern.listIds||[]).includes(l.id));

  return <div style={{background:t.surface,border:`1px solid ${tagFocused?t.accentMid:t.border}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)",transition:"border-color 0.1s"}}>
    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Tags</div>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginBottom:memberLists.length>0?8:0}}>
      {memberLists.map(l=>(
        <div key={l.id} style={{display:"flex",alignItems:"center",gap:3,background:l.colorLight,border:`1px solid ${l.color}40`,borderRadius:20,padding:"3px 8px 3px 12px"}}>
          <span style={{fontSize:12,color:l.color,fontWeight:500}}>{l.name}</span>
          <button onClick={()=>onUpdateIntern({...intern,listIds:(intern.listIds||[]).filter(id=>id!==l.id)})}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:l.color,opacity:0.5,padding:"0 2px",lineHeight:1}}
            onMouseEnter={e=>e.currentTarget.style.opacity="1"}
            onMouseLeave={e=>e.currentTarget.style.opacity="0.5"}>✕</button>
        </div>
      ))}
    </div>
    <div style={{position:"relative"}}>
      <input
        value={tagInput}
        onChange={e=>setTagInput(e.target.value)}
        onFocus={()=>setTagFocused(true)}
        onBlur={()=>setTimeout(()=>setTagFocused(false),150)}
        onKeyDown={e=>{if(e.key==="Enter"&&tagInput.trim()){addTag(tagInput);}if(e.key==="Escape"){setTagInput("");setTagFocused(false);}}}
        placeholder="Type a tag and press Enter…"
        style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 10px",fontSize:12,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}
      />
      {tagFocused&&suggestions.length>0&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:t.surface,border:`1px solid ${t.border}`,borderRadius:8,boxShadow:"0 6px 20px rgba(0,0,0,0.1)",zIndex:100,marginTop:4,overflow:"hidden"}}>
        {suggestions.slice(0,6).map(l=>(
          <button key={l.id} onMouseDown={()=>addTag(l.name)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",border:"none",padding:"8px 12px",cursor:"pointer",textAlign:"left",fontSize:12,color:t.text,fontFamily:"inherit"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
            <div style={{width:8,height:8,borderRadius:"50%",background:l.color,flexShrink:0}}/>
            {l.name}
          </button>
        ))}
        {tagInput.trim()&&!lists.some(l=>l.name.toLowerCase()===tagInput.trim().toLowerCase())&&(
          <button onMouseDown={()=>addTag(tagInput)}
            style={{display:"flex",alignItems:"center",gap:8,width:"100%",background:"none",borderTop:`1px solid ${t.borderLight}`,border:"none",padding:"8px 12px",cursor:"pointer",textAlign:"left",fontSize:12,color:t.accentText,fontFamily:"'DM Mono',monospace"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.accentLight}
            onMouseLeave={e=>e.currentTarget.style.background="none"}>
            + Create "{tagInput.trim()}"
          </button>
        )}
      </div>}
    </div>
  </div>;
}

function InternProfile({intern,groups,lists,setLists,colleagues,setColleagues,onBack,onUpdateIntern,onDelete,onConsult,onOpenLab,onGroupClick,T}) {
  const t=T||THEMES.sage;
  const [tab,setTab]=useState("overview");
  const [shareOpen,setShareOpen]=useState(false);
  const [linkOpen,setLinkOpen]=useState(false);
  const [exportOpen,setExportOpen]=useState(false);
  const [flagOpen,setFlagOpen]=useState(false);
  const [editProfileOpen,setEditProfileOpen]=useState(false);
  const [aiSessionOpen,setAiSessionOpen]=useState(false);
  const [showConfetti,setShowConfetti]=useState(false);
  const [showCompleteConfirm,setShowCompleteConfirm]=useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm]=useState(false);
  const tabs=["overview","hours","sessions","cases","evaluations","documents",...(!intern.proBono?["payments"]:[])];
  const tabLabel={overview:"Overview",hours:"Hours",sessions:"Notes",cases:"Cases",evaluations:"Evaluations",documents:"Documents",payments:"Payments"};
  const memberGroups=groups.filter(g=>(intern.groupIds||[]).includes(g.id));
  const memberLists=lists.filter(l=>(intern.listIds||[]).includes(l.id));

  const handleCompleteIntern=()=>{
    setShowCompleteConfirm(false);
    setShowConfetti(true);
    setTimeout(()=>{
      onUpdateIntern({...intern,status:"inactive",inactiveDate:"Mar 2026",retentionYear:2026});
      setShowConfetti(false);
    },2600);
  };
  const rs=retSt(intern); const af=activeFlags(intern);

  return <div>
    {/* Delete confirmation modal */}
    {showDeleteConfirm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setShowDeleteConfirm(false)}>
      <div style={{background:"#fff",borderRadius:16,padding:"32px 36px",width:440,boxShadow:"0 24px 64px rgba(0,0,0,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:22,fontWeight:600,color:"#1A1A2E",marginBottom:8}}>Delete {intern.name}?</div>
        <div style={{fontSize:14,color:"#666",lineHeight:1.7,marginBottom:6}}>
          This will permanently remove {dn(intern)} from your SupTrack account, including all session notes, hours, documents, and case records.
        </div>
        <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#991B1B",marginBottom:24,lineHeight:1.6}}>
          ⚠ This cannot be undone. Export their records first if you need them.
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={()=>setShowDeleteConfirm(false)}
            style={{background:"none",border:"1px solid #E5E5E5",borderRadius:9,padding:"9px 20px",cursor:"pointer",fontSize:14,color:"#666",fontFamily:"inherit"}}>
            Cancel
          </button>
          <button onClick={()=>{setShowDeleteConfirm(false);onDelete&&onDelete(intern.id);}}
            style={{background:S.red,color:"#fff",border:"none",borderRadius:9,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit"}}>
            Yes, delete permanently
          </button>
        </div>
      </div>
    </div>}
    {shareOpen&&<ShareModal T={t} title={dn(intern)} sharedWith={intern.sharedWith||[]} colleagues={colleagues} setColleagues={setColleagues} onSave={s=>{onUpdateIntern({...intern,sharedWith:s});setShareOpen(false);}} onClose={()=>setShareOpen(false)}/>}
    {linkOpen&&<ShareLinkModal T={t} intern={intern} onClose={()=>setLinkOpen(false)}/>}
    {exportOpen&&<ExportModal T={t} intern={intern} groups={groups} onClose={()=>setExportOpen(false)}/>}
    {flagOpen&&<FlagModal T={t} intern={intern} onSave={flags=>{onUpdateIntern({...intern,flags});setFlagOpen(false);}} onClose={()=>setFlagOpen(false)}/>}
    {editProfileOpen&&<EditProfileModal T={t} intern={intern} onSave={onUpdateIntern} onClose={()=>setEditProfileOpen(false)}/>}
    {aiSessionOpen&&<AISessionModal T={t} intern={intern} onSave={session=>{
      const update={...intern,sessions:[session,...(intern.sessions||[])]};
      if(session._hourLog){update.hourLog=session._hourLog;update.hoursCompleted=session._newTotal;}
      onUpdateIntern(update);
    }} onClose={()=>setAiSessionOpen(false)}/>}

    <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:13,padding:"0 0 16px",fontFamily:"'DM Mono',monospace"}}>← Back</button>

    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:16,padding:"24px 28px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      {af.length>0&&<div style={{display:"flex",gap:8,marginBottom:14,padding:"10px 14px",background:t.accentLight,borderRadius:10,flexWrap:"wrap"}}>
        <span style={{fontSize:12,color:t.accentText,fontFamily:"'DM Mono',monospace",fontWeight:600}}>OPEN FLAGS</span>
        {af.map(f=>{const cat=FLAG_CATS.find(c=>c.id===f.category)||FLAG_CATS[5]; return <div key={f.id} style={{display:"flex",gap:5,alignItems:"center"}}><div style={{width:7,height:7,borderRadius:"50%",background:cat.color}}/><span style={{fontSize:12,color:cat.color,fontFamily:"'DM Mono',monospace"}}>{cat.label}</span><span style={{fontSize:12,color:t.muted}}>— {f.note.slice(0,50)}{f.note.length>50?"...":""}</span></div>;})}
        <button onClick={()=>setFlagOpen(true)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:t.accentText,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>Manage flags →</button>
      </div>}

      <div style={{display:"flex",alignItems:"flex-start",gap:20}}>
        <Avatar initials={intern.initials} size={58} T={t} photo={intern.photo} editable={intern.status==="active"} onPhotoChange={url=>onUpdateIntern({...intern,photo:url})}/>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:2}}>
            <h2 style={{fontFamily:"inherit",fontSize:24,fontWeight:400,color:t.text,margin:0,letterSpacing:"-0.02em"}}>{dn(intern)}</h2>
            {intern.preferredName&&<span style={{fontSize:13,color:t.muted}}>(legal: {intern.name})</span>}
            {intern.pronouns&&<span style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.pronouns}</span>}
          </div>
          <div style={{color:t.muted,fontSize:13,marginBottom:12}}>{intern.credentialBody} — {intern.credential} · Goal: {intern.licenseGoal} · Since {intern.startDate}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <RoleBadge role={intern.supervisorRole}/><TypeBadge type={intern.discipline||intern.internType}/>
            {intern.status==="active"&&<PayBadge intern={intern} T={t}/>}
            {intern.status==="inactive"&&<Badge color="#7A7060" bg="#F0ECE4">Inactive since {intern.inactiveDate}</Badge>}
            {rs&&<Badge color={rs.color} bg={rs.bg}>{rs.label}</Badge>}
            {memberLists.map(l=><Badge key={l.id} color={l.color} bg={l.colorLight}>{l.name}</Badge>)}
            {memberGroups.map(g=><Badge key={g.id} color={g.color} bg={g.colorLight}>{g.name}</Badge>)}
            {intern.sharedWith?.length>0&&<SharedAvatars sharedWith={intern.sharedWith} size={22} colleagues={colleagues||[]}/>}
            {af.length>0&&<button onClick={()=>setFlagOpen(true)} style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:6,padding:"2px 10px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{af.length} open flag{af.length>1?"s":""}</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"flex-start",position:"relative"}}>
          <InternActionsMenu T={t} intern={intern} onConsult={onConsult} onFlagOpen={()=>setFlagOpen(true)} onLinkOpen={()=>setLinkOpen(true)} onExportOpen={()=>setExportOpen(true)} onShareOpen={()=>setShareOpen(true)} onAiSession={()=>setAiSessionOpen(true)} onComplete={()=>setShowCompleteConfirm(true)} onEditProfile={()=>setEditProfileOpen(true)} onDelete={()=>setShowDeleteConfirm(true)}/>
        </div>
      </div>

      {/* Complete intern confirm */}
      {showCompleteConfirm&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setShowCompleteConfirm(false)}>
        <div style={{background:t.surface,borderRadius:18,padding:"32px 36px",maxWidth:420,width:"90%",boxShadow:"0 24px 64px rgba(0,0,0,0.2)",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
          <div style={{fontSize:48,marginBottom:12}}>🎓</div>
          <h3 style={{fontFamily:"inherit",fontSize:22,color:t.text,margin:"0 0 10px",fontWeight:400}}>Complete {dn(intern)}'s supervision?</h3>
          <p style={{fontSize:14,color:t.muted,lineHeight:1.7,margin:"0 0 24px"}}>This will mark {dn(intern)} as inactive and start the 7-year HIPAA retention clock. This is a big deal — make sure they're ready!</p>
          <div style={{display:"flex",gap:10,justifyContent:"center"}}>
            <button onClick={()=>setShowCompleteConfirm(false)} style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 22px",cursor:"pointer",fontSize:14,color:t.muted,fontFamily:"inherit"}}>Not yet</button>
            <button onClick={handleCompleteIntern} style={{background:"linear-gradient(135deg,#4ADE80,#60A5FA)",border:"none",borderRadius:10,padding:"10px 24px",cursor:"pointer",fontSize:14,color:"#fff",fontWeight:600,fontFamily:"inherit",boxShadow:"0 4px 16px rgba(96,165,250,0.4)"}}>🎉 Yes, they're done!</button>
          </div>
        </div>
      </div>}

      {/* Confetti */}
      <Confetti active={showConfetti}/>
    </div>

    <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,marginBottom:22}}>
      {tabs.map(tt=><button key={tt} onClick={()=>setTab(tt)} style={{background:"none",border:"none",borderBottom:tab===tt?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 14px",cursor:"pointer",fontSize:13,color:tab===tt?t.accent:t.muted,fontFamily:"'DM Mono',monospace",marginBottom:-1}}>{tabLabel[tt]}</button>)}
    </div>

    {tab==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12}}>
        <StatCard T={t} label="Hours Completed" value={(intern.hoursCompleted||0).toLocaleString()} sub={`of ${intern.hoursTotal.toLocaleString()} required`} color={t.accent}/>
        <StatCard T={t} label="Completion" value={`${Math.round((intern.hoursCompleted||0)/(intern.hoursTotal||1)*100)}%`} sub="Toward licensure goal"/>
        <StatCard T={t} label="Sessions logged" value={intern.sessions?.length||0}/>
        <StatCard T={t} label="Cases staffed" value={intern.cases?.length||0}/>
      </div>

      {/* Progress bar */}
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:13,color:t.text}}>Progress toward {intern.licenseGoal}</span>
          <span style={{fontSize:13,color:t.accent,fontFamily:"'DM Mono',monospace"}}>{intern.hoursCompleted} / {intern.hoursTotal} hrs</span>
        </div>
        <div style={{height:10,background:t.borderLight,borderRadius:999,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${Math.min(100,Math.round(intern.hoursCompleted/intern.hoursTotal*100))}%`,background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999,transition:"width 0.6s ease"}}/>
        </div>
        {intern.hoursCompleted>=intern.hoursTotal&&<div style={{fontSize:12,color:t.accentText,marginTop:6}}>✓ Required hours complete — ready to apply for licensure</div>}
        {/* Intern-reported total — shown when different from supervisor log */}
        {(()=>{
          const intTotal = sumHours(intern.internHourLog||[]);
          const diff = intTotal - intern.hoursCompleted;
          if (!intern.internHourLog?.length) return null;
          return <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:t.muted}}>Intern reported: <span style={{fontFamily:"'DM Mono',monospace",color:t.text}}>{intTotal} hrs</span></span>
            {diff!==0&&<span style={{fontSize:11,fontFamily:"'DM Mono',monospace",color:t.accentText,background:t.accentLight,borderRadius:4,padding:"1px 6px"}}>
              {diff>0?"+":""}{diff} vs your log ⚠
            </span>}
            {diff===0&&<span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>✓ matches your log</span>}
          </div>;
        })()}
      </div>

      {/* Credential & discipline info */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span>Credential & Info</span>
            <button onClick={()=>setEditProfileOpen(true)}
              style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:10,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"none",letterSpacing:"normal"}}>
              ✎ Edit
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {[
              ["Discipline",    <TypeBadge type={intern.discipline||intern.internType}/>],
              ["Credential",    <span style={{fontSize:13,color:t.text,fontFamily:"'DM Mono',monospace"}}>{intern.credential}</span>],
              intern.discipline==="student"&&intern.university
                ? ["University", <span style={{fontSize:13,color:t.muted}}>{intern.university}</span>]
                : ["Cred. body", <span style={{fontSize:13,color:t.muted}}>{intern.credentialBody}</span>],
              ["Goal",          <span style={{fontSize:13,color:t.accentText,background:t.accentLight,borderRadius:6,padding:"2px 8px",fontFamily:"'DM Mono',monospace"}}>{intern.licenseGoal}</span>],
              ["Start date",    <span style={{fontSize:13,color:t.muted}}>{intern.startDate}</span>],
              ["Date of birth", intern.dob
                ? (()=>{
                    const d=new Date(intern.dob+"T00:00:00");
                    const age=Math.floor((new Date()-d)/(365.25*24*60*60*1000));
                    const formatted=d.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
                    const isToday=d.getMonth()===new Date().getMonth()&&d.getDate()===new Date().getDate();
                    return <span style={{fontSize:13,color:t.muted}}>{formatted} · Age {age}{isToday?" 🎂":""}</span>;
                  })()
                : <button onClick={()=>setEditProfileOpen(true)} style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:6,padding:"2px 10px",cursor:"pointer",fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>+ Add DOB</button>],
              intern.gender&&["Gender",     <span style={{fontSize:13,color:t.muted}}>{intern.gender}</span>],
              intern.race&&["Race",         <span style={{fontSize:13,color:t.muted}}>{intern.race}</span>],
              intern.ethnicity&&["Ethnicity",<span style={{fontSize:13,color:t.muted}}>{intern.ethnicity}</span>],
              intern.phone&&["Phone",       <a href={`tel:${intern.phone}`} style={{fontSize:13,color:t.accentText,textDecoration:"none",fontFamily:"'DM Mono',monospace"}}>{intern.phone}</a>],
              intern.email&&["Email",       <a href={`mailto:${intern.email}`} style={{fontSize:13,color:t.accentText,textDecoration:"none"}}>{intern.email}</a>],
            ].filter(Boolean).map(([label,val])=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingBottom:7,borderBottom:`1px solid ${t.borderLight}`}}>
                <span style={{fontSize:12,color:t.muted,flexShrink:0}}>{label}</span>
                <span style={{textAlign:"right",marginLeft:8}}>{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Tags — type to create new, click × to remove */}
          <TagsBox intern={intern} lists={lists} memberLists={memberLists} t={t} onUpdateIntern={onUpdateIntern} setLists={setLists}/>

          {/* Groups — with edit button */}
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>Groups</span>
              <button onClick={()=>setEditProfileOpen(true)}
                style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"1px 8px",cursor:"pointer",fontSize:10,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"none",letterSpacing:"normal"}}>
                ✎ Edit
              </button>
            </div>
            {memberGroups.length>0
              ? <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {memberGroups.map(g=>(
                    <div key={g.id} onClick={()=>onGroupClick&&onGroupClick(g.id)}
                      style={{display:"flex",alignItems:"center",gap:6,background:g.colorLight,border:`1px solid ${g.color}40`,borderRadius:20,padding:"3px 12px",cursor:"pointer"}}
                      title={`Open ${g.name}`}>
                      <div style={{width:6,height:6,borderRadius:"50%",background:g.color}}/>
                      <span style={{fontSize:12,color:g.color,fontWeight:500}}>{g.name}</span>
                    </div>
                  ))}
                </div>
              : <span style={{fontSize:12,color:t.faint,fontStyle:"italic"}}>Not in any groups — click Edit to assign</span>}
          </div>
          {/* Sharing — always visible with edit button */}
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>Shared with</span>
              <button onClick={()=>setShareOpen(true)}
                style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"1px 8px",cursor:"pointer",fontSize:10,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"none",letterSpacing:"normal"}}>
                ✎ Edit
              </button>
            </div>
            {intern.sharedWith?.length>0
              ? <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {(intern.sharedWith||[]).map(s=>{
                    const col=(colleagues||[]).find(c=>c.id===s.colleagueId);
                    return col?<div key={s.colleagueId} style={{display:"flex",alignItems:"center",gap:6,background:t.surfaceAlt,borderRadius:8,padding:"5px 10px"}}>
                      <Avatar initials={col.initials} size={22} color={col.color} textColor="#fff"/>
                      <span style={{fontSize:12,color:t.text}}>{col.name}</span>
                      <span style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{pmSum(s.perms)}</span>
                    </div>:null;
                  })}
                </div>
              : <span style={{fontSize:12,color:t.faint,fontStyle:"italic"}}>Not shared — click Edit to share access</span>}
          </div>
          {/* Employment & Emergency Contact */}
          <EmploymentCard intern={intern} onUpdateIntern={onUpdateIntern} T={t}/>

        {/* SOS-specific callout */}
        {intern.discipline==="sos"&&<div style={{background:"#E0F5F0",border:"1px solid #1A6B5C40",borderRadius:12,padding:"14px 16px"}}>
            <div style={{fontSize:12,color:"#1A6B5C",fontWeight:500,marginBottom:4}}>Supervision of Supervision</div>
            <div style={{fontSize:12,color:"#1A6B5C",lineHeight:1.6,marginBottom:10}}>{dn(intern)} is working toward {intern.licenseGoal}. Practice supervising with an AI simulated intern in the Supervision Lab.</div>
            <button onClick={()=>onOpenLab&&onOpenLab()} style={{background:"#1A6B5C",color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>✦ Open Supervision Lab</button>
          </div>}
        </div>
      </div>

      {/* Recent session */}
      {intern.sessions?.length>0&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Most recent session</div>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <Badge color={t.muted} bg={t.surfaceAlt}>{intern.sessions[0].date}</Badge>
          <Badge color={t.accentText} bg={t.accentLight}>{intern.sessions[0].type}</Badge>
          <Badge color={t.muted} bg={t.surfaceAlt}>{intern.sessions[0].duration}</Badge>
        </div>
        <p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{intern.sessions[0].notes}</p>
      </div>}
    </div>}

    {tab==="hours"&&<HoursBreakdown intern={intern} T={t} onUpdateIntern={onUpdateIntern}/>}

    {tab==="sessions"&&<div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
        <Btn T={t} small onClick={()=>setAiSessionOpen(true)}>✦ Log Session with AI</Btn>
      </div>
      <div style={{background:t.accentLight,borderRadius:10,padding:"11px 16px",fontSize:13,color:t.accentText,marginBottom:16,border:`1px solid ${t.accentMid}`}}>Individual notes for {dn(intern)}. Notes by colleagues are marked. Group sessions are linked automatically.</div>
      {(intern.sessions||[]).map((s,i)=>{const byCol=s.author!=="Alyson"; return <div key={i} style={{background:t.surface,border:`1px solid ${t.border}`,borderLeft:`3px solid ${byCol?S.purple:t.accent}`,borderRadius:12,padding:"16px 20px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge><Badge color={t.accentText} bg={t.accentLight}>{s.type}</Badge><Badge color={t.muted} bg={t.surfaceAlt}>{s.duration}</Badge><span style={{fontSize:12,color:t.accent,opacity:byCol?0.65:1,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{s.author}</span></div>
        <p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7}}>{s.notes}</p>
      </div>;})}
      {memberGroups.map(g=>(g.sessions||[]).map((s,i)=><div key={`${g.id}-${i}`} style={{background:t.surface,border:`1px solid ${g.color}40`,borderLeft:`3px solid ${g.color}`,borderRadius:12,padding:"16px 18px",marginBottom:10}}>
        <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}><Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge><Badge color={g.color} bg={g.colorLight}>{g.name}</Badge><span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{s.author}</span></div>
        <p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7}}>{s.notes}</p>
      </div>))}
    </div>}

    {tab==="cases"&&<CasesTab intern={intern} onUpdateIntern={onUpdateIntern} T={t}/>}

    {tab==="evaluations"&&<EvaluationTab intern={intern} onUpdateIntern={onUpdateIntern} T={t}/>}

    {tab==="documents"&&<DocumentsTab key={intern.id} intern={intern} onUpdateIntern={onUpdateIntern} T={t}/>}

    {tab==="payments"&&!intern.proBono&&<PaymentsTab key={intern.id} intern={intern} onUpdateIntern={onUpdateIntern} T={t}/>}

  </div>;
}

// ── Dashboard ──────────────────────────────────────────────────────────────
// ── AlertsSection — extracted so hooks are at proper component top level ────
function AlertsSection({visible,interns,t,onNavigate,onSelectIntern,todos,setTodos,dismissedAlerts,setDismissedAlerts,snoozedAlerts,setSnoozedAlerts}) {
  const [openMenuId,setOpenMenuId]=useState(null);

  // Close menu on outside click
  React.useEffect(()=>{
    const close=()=>setOpenMenuId(null);
    document.addEventListener("click",close);
    return ()=>document.removeEventListener("click",close);
  },[]);

  return <div style={{marginBottom:28}}>
    <div style={{fontFamily:"inherit",fontSize:16,color:t.text,marginBottom:10,letterSpacing:"-0.01em"}}>
      Alerts <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{visible.length} need attention</span>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {visible.map(alert=>{
        const as=alertStyle(alert.severity,t);
        const menuOpen=openMenuId===alert.id;
        return <div key={alert.id} style={{background:as.bg,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,borderLeft:`${as.borderWidth}px solid ${as.border}`,border:`1px solid ${as.border}`,borderLeftWidth:as.borderWidth,position:"relative"}}>
          <span style={{fontSize:16,flexShrink:0}}>{alertIcon(alert.type)}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
              <span style={{fontSize:10,fontFamily:"'DM Mono',monospace",fontWeight:600,letterSpacing:"0.07em",color:as.labelColor,textTransform:"uppercase"}}>{as.label}</span>
            </div>
            <div style={{fontSize:13,color:t.text,lineHeight:1.5}}>{alert.message}</div>
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
            <button onClick={()=>{if(alert.internId){const intern=interns.find(i=>i.id===alert.internId);if(intern)onSelectIntern(intern);}else onNavigate(alert.action,null);}}
              style={{background:"none",border:`1px solid ${as.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12,color:as.labelColor,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>View</button>
            <div style={{position:"relative"}}>
              <button onClick={e=>{e.stopPropagation();setOpenMenuId(menuOpen?null:alert.id);}}
                style={{background:"none",border:`1px solid ${as.border}`,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:13,color:as.labelColor,lineHeight:1}}>···</button>
              {menuOpen&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:"calc(100% + 4px)",background:t.surface,border:`1px solid ${t.border}`,borderRadius:10,boxShadow:"0 8px 24px rgba(0,0,0,0.12)",zIndex:100,minWidth:170,padding:"5px 0"}}>
                {[
                  {label:"📋 Add to to-do", action:()=>{setTodos(p=>[...p,{id:Date.now(),text:alert.message,done:false,link:"none"}]);setDismissedAlerts(s=>new Set([...s,alert.id]));setOpenMenuId(null);}},
                  {label:"⏰ Remind me in 24h", action:()=>{setSnoozedAlerts(s=>({...s,[alert.id]:Date.now()+24*60*60*1000}));setOpenMenuId(null);}},
                  {label:"⏰ Remind me in 48h", action:()=>{setSnoozedAlerts(s=>({...s,[alert.id]:Date.now()+48*60*60*1000}));setOpenMenuId(null);}},
                ].map(item=><button key={item.label} onClick={item.action}
                  style={{display:"block",width:"100%",background:"none",border:"none",padding:"8px 14px",cursor:"pointer",fontSize:13,color:t.text,textAlign:"left",fontFamily:"inherit"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>{item.label}</button>)}
                <div style={{height:1,background:t.borderLight,margin:"4px 0"}}/>
                <button onClick={()=>{setDismissedAlerts(s=>new Set([...s,alert.id]));setOpenMenuId(null);}}
                  style={{display:"block",width:"100%",background:"none",border:"none",padding:"8px 14px",cursor:"pointer",fontSize:13,color:S.red,textAlign:"left",fontFamily:"inherit"}}
                  onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
                  onMouseLeave={e=>e.currentTarget.style.background="none"}>✕ Dismiss</button>
              </div>}
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

function Dashboard({interns,groups,lists,colleagues,onSelectIntern,onNavigate,onOpenOnboarding,onAddIntern,onQuickAction,supervisorName,quickActionOrder,quickActionHidden,allQuickActions,onQuickActionReorder,onQuickActionToggle,T}) {
  const t=T||THEMES.sage;
  const alerts = useMemo(()=>generateAlerts(interns),[interns]);
  const [activeList,setActiveList]=useState("all");
  const [showInactive,setShowInactive]=useState(false);
  const [visibleStats,setVisibleStats]=useState(DEFAULT_STATS);
  const [sections,setSections]=useState(DEFAULT_SECTIONS.map(s=>({...s,collapsed:false})));
  const [customizing,setCustomizing]=useState(false);
  const [dragIdx,setDragIdx]=useState(null);
  const [dragOver,setDragOver]=useState(null);
  const [todos,setTodos]=useState([
    {id:1, text:"Renew liability insurance by April 30",    done:false, link:"none"},
    {id:2, text:"Update supervision agreement template",     done:false, link:"agreements"},
    {id:3, text:"Schedule quarterly peer consultation",      done:false, link:"none"},
  ]);
  const [newTodo,setNewTodo]=useState("");
  const [newTodoLink,setNewTodoLink]=useState("none");
  const [showNewTodo,setShowNewTodo]=useState(false);
  const [dismissedAlerts,setDismissedAlerts]=useState(new Set());
  const [snoozedAlerts,setSnoozedAlerts]=useState({});

  // Live clock
  const [now,setNow]=useState(new Date());
  React.useEffect(()=>{
    const id=setInterval(()=>setNow(new Date()),1000);
    return ()=>clearInterval(id);
  },[]);

  // Random uplifting greeting — picked once per session
  const GREETINGS = [
    "Hey there,","Howdy,","Hey,","Hi there,","Hello there,","Well hey,",
    "Oh hey,","Good to see you,","Hi,","Hello,",
  ];
  const [greeting] = useState(()=>GREETINGS[Math.floor(Math.random()*GREETINGS.length)]);

  const firstName = supervisorName ? supervisorName.split(" ")[0] : "there";
  const dateStr = now.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});
  const timeStr = now.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit",hour12:true});

  const active=interns.filter(i=>i.status==="active");
  const inactive=interns.filter(i=>i.status==="inactive");
  const display=showInactive?interns:active;
  const filtered=activeList==="all"?display:display.filter(i=>(i.listIds||[]).includes(activeList));

  const sv=(id)=>({active:active.length,hours:active.reduce((s,i)=>s+i.hoursCompleted,0).toLocaleString(),groups:groups.length,overdue:active.filter(i=>!i.proBono&&i.paymentStatus==="overdue").length,primary:active.filter(i=>i.supervisorRole==="primary").length,secondary:active.filter(i=>i.supervisorRole==="secondary").length,student:active.filter(i=>i.discipline==="student").length,licensed:active.filter(i=>i.discipline!=="student"&&i.discipline!=="sos").length,sos:active.filter(i=>i.discipline==="sos").length,flagged:active.filter(i=>activeFlags(i).length>0).length}[id]);
  const sc=(id)=>{
    const sh=t.shades||[t.accentLight,t.accentMid,t.accent,t.accentText,t.accentText,t.accentText];
    return {
      active:   sh[3]||t.accent,
      hours:    sh[2]||t.accent,
      groups:   sh[3]||t.accent,
      overdue:  sh[4]||t.accentText,
      flagged:  sh[4]||t.accentText,
      primary:  sh[3]||t.accent,
      secondary:sh[2]||t.accent,
      student:  sh[2]||t.accent,
      licensed: sh[3]||t.accent,
      sos:      sh[4]||t.accentText,
    }[id]||t.accent;
  };
  const toggleSec=(id)=>setSections(p=>p.map(s=>s.id===id?{...s,collapsed:!s.collapsed}:s));
  const onDrop=(i)=>{if(dragIdx===null||dragIdx===i)return;setSections(p=>{const n=[...p];const[m]=n.splice(dragIdx,1);n.splice(i,0,m);return n;});setDragIdx(null);setDragOver(null);};
  const sharedInterns=interns.filter(i=>i.sharedWith?.length>0);

  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:30,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>{greeting} {firstName}</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>{dateStr} · <span style={{fontFamily:"'DM Mono',monospace",fontSize:13}}>{timeStr}</span></p>
      </div>
      <Btn T={t} variant="secondary" onClick={()=>setCustomizing(c=>!c)}>{customizing?"Done":"Customize"}</Btn>
<button onClick={async()=>{await supabase.auth.signOut();window.location.reload();}} title="Sign Out" style={{background:"none",border:"none",cursor:"pointer",padding:"8px",borderRadius:"8px",color:t.muted,display:"flex",alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.color=t.text} onMouseLeave={e=>e.currentTarget.style.color=t.muted}>
  onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
  title="Sign Out"
  style={{background:"none", border:"none", cursor:"pointer", padding:"8px", color:t.muted, display:"flex", alignItems:"center"}}
  onMouseEnter={e => e.currentTarget.style.color = t.text}
  onMouseLeave={e => e.currentTarget.style.color = t.muted}
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
</button>    {/* Add Intern shortcut — left aligned */}
    <div style={{marginBottom:26,display:"flex",justifyContent:"flex-start"}}>
      <button onClick={()=>onAddIntern&&onAddIntern()}
        style={{background:t.isGradient?t.gradient:t.accent,backgroundSize:t.isGradient?"200% 200%":undefined,animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",border:"none",borderRadius:12,padding:"12px 22px",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",boxShadow:`0 2px 10px ${t.accent}40`,transition:"opacity 0.15s",display:"inline-flex",alignItems:"center",gap:8}}
        onMouseEnter={e=>e.currentTarget.style.opacity="0.88"}
        onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
        <span style={{fontSize:18}}>+</span> Add Supervisee
      </button>
    </div>

    {customizing&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px",marginBottom:24,boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
      <div style={{fontSize:14,fontWeight:500,color:t.text,marginBottom:12}}>Stat cards</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>{ALL_STAT_OPTIONS.map(opt=>{const on=visibleStats.includes(opt.id);return <button key={opt.id} onClick={()=>setVisibleStats(p=>on?p.filter(x=>x!==opt.id):[...p,opt.id])} style={{background:on?t.accentLight:t.surfaceAlt,color:on?t.accentText:t.muted,border:`1px solid ${on?t.accentMid:t.border}`,borderRadius:8,padding:"6px 14px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{on?"✓ ":""}{opt.label}</button>;})}</div>

      {/* Quick Actions customization */}
      <div style={{fontSize:14,fontWeight:500,color:t.text,marginBottom:8}}>Quick actions — toggle & drag to reorder</div>
      <div style={{marginBottom:16}}>
        {(quickActionOrder||[]).map((id,i)=>{
          const item=(allQuickActions||[]).find(a=>a.id===id);
          if(!item) return null;
          const hidden=(quickActionHidden||new Set()).has(id);
          return <div key={id} draggable
            onDragStart={()=>setDragIdx(i)}
            onDragOver={e=>{e.preventDefault();setDragOver(i);}}
            onDrop={()=>{
              if(dragIdx===null||dragIdx===i)return;
              const arr=[...(quickActionOrder||[])];
              const[m]=arr.splice(dragIdx,1);arr.splice(i,0,m);
              onQuickActionReorder&&onQuickActionReorder(arr);
              setDragIdx(null);setDragOver(null);
            }}
            onDragEnd={()=>{setDragIdx(null);setDragOver(null);}}
            style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:8,marginBottom:4,background:dragOver===i?t.accentLight:t.surfaceAlt,border:`1px solid ${dragOver===i?t.accentMid:t.border}`,cursor:"grab",opacity:hidden?0.45:1,transition:"opacity 0.15s"}}>
            <span style={{color:t.faint,fontSize:13}}>⠿</span>
            <span style={{flex:1,fontSize:13,color:t.text}}>{item.label}</span>
            <button onClick={()=>onQuickActionToggle&&onQuickActionToggle(id)}
              style={{background:hidden?"none":t.accent,border:`1px solid ${hidden?t.border:t.accent}`,borderRadius:4,width:34,height:18,cursor:"pointer",position:"relative",transition:"all 0.15s",flexShrink:0}}>
              <span style={{position:"absolute",top:2,left:hidden?2:16,width:14,height:14,borderRadius:"50%",background:hidden?t.muted:"#fff",transition:"left 0.15s"}}/>
            </button>
          </div>;
        })}
        <button onClick={()=>{
          onQuickActionReorder&&onQuickActionReorder((allQuickActions||[]).map(a=>a.id));
          onQuickActionToggle&&onQuickActionToggle("__reset__");
        }} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:6}}>
          Reset to default
        </button>
      </div>

      <div style={{fontSize:14,fontWeight:500,color:t.text,marginBottom:10}}>Sections — drag to reorder</div>
      {sections.map((sec,i)=><div key={sec.id} draggable onDragStart={()=>setDragIdx(i)} onDragOver={e=>{e.preventDefault();setDragOver(i);}} onDrop={()=>onDrop(i)} onDragEnd={()=>{setDragIdx(null);setDragOver(null);}} style={{background:dragOver===i?t.accentLight:t.surfaceAlt,border:`1px solid ${dragOver===i?t.accentMid:t.border}`,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,cursor:"grab",marginBottom:8}}>
        <span style={{color:t.faint}}>⠿</span><span style={{flex:1,fontSize:13,color:t.text}}>{sec.label}</span>
        <button onClick={()=>toggleSec(sec.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{sec.collapsed?"show":"hide"}</button>
      </div>)}
    </div>}

    {visibleStats.length>0&&<div style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(visibleStats.length,4)},1fr)`,gap:14,marginBottom:28}}>{visibleStats.map(id=>{
      const opt=ALL_STAT_OPTIONS.find(o=>o.id===id);
      const handleClick={
        active:    ()=>onNavigate("interns",null),
        hours:     ()=>onNavigate("interns",null),
        groups:    ()=>onNavigate("groups",null),
        overdue:   ()=>onNavigate("payments",null),
        primary:   ()=>onNavigate("interns","primary"),
        secondary: ()=>onNavigate("interns","secondary"),
        student:   ()=>onNavigate("interns","student"),
        licensed:  ()=>onNavigate("interns","licensed"),
        sos:       ()=>onNavigate("interns","sos"),
        flagged:   ()=>onNavigate("interns","flagged"),
      }[id];
      return <StatCard key={id} T={t} label={opt.label} value={sv(id)} color={sc(id)} onClick={handleClick}/>;
    })}</div>}

    {/* ── To-do list ── */}
    {(()=>{
      const LINK_OPTIONS = [
        {id:"none",       label:"No link"},
        {id:"dashboard",  label:"Dashboard"},
        {id:"interns",    label:"Supervisees"},
        {id:"groups",     label:"Groups"},
        {id:"payments",   label:"Payments"},
        {id:"ce",         label:"CE Tracker"},
        {id:"agreements", label:"Agreements"},
        {id:"reminders",   label:"Reminders"},
        {id:"discover",   label:"🔭 Discover"},
        {id:"profile",    label:"My Profile"},
        {id:"billing",    label:"Plan & Billing"},
        {id:"reminders",  label:"Reminders"},
        {id:"reminders",  label:"Reminders"},
    {id:"support",    label:"Support"},
        ...interns.filter(i=>i.status==="active").map(i=>({id:`intern:${i.id}`,label:`→ ${dn(i)}`})),
      ];

      const navigate = (link) => {
        if(!link||link==="none") return;
        if(link.startsWith("intern:")){
          const id=Number(link.split(":")[1]);
          const intern=interns.find(i=>i.id===id);
          if(intern) onSelectIntern(intern);
        } else {
          onNavigate(link,null);
        }
      };

      const addTodo = () => {
        if(!newTodo.trim()) return;
        setTodos(p=>[...p,{id:Date.now(),text:newTodo.trim(),done:false,link:newTodoLink}]);
        setNewTodo(""); setNewTodoLink("none"); setShowNewTodo(false);
      };

      return <div style={{marginBottom:24}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{fontFamily:"inherit",fontSize:16,color:t.text,letterSpacing:"-0.01em"}}>To-do</div>
          <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{todos.length} remaining</span>
          <button onClick={()=>setShowNewTodo(s=>!s)}
            style={{marginLeft:"auto",background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
            + Add
          </button>
        </div>

        {/* Add form */}
        {showNewTodo&&<div style={{background:t.surface,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"12px 14px",marginBottom:10}}>
          <input value={newTodo} onChange={e=>setNewTodo(e.target.value)} placeholder="What do you need to do?" autoFocus
            onKeyDown={e=>{if(e.key==="Enter")addTodo();if(e.key==="Escape")setShowNewTodo(false);}}
            style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:7,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box",marginBottom:8}}/>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:t.muted,whiteSpace:"nowrap"}}>Link to:</span>
            <select value={newTodoLink} onChange={e=>setNewTodoLink(e.target.value)}
              style={{flex:1,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 10px",fontSize:12,color:t.text,background:t.bg,outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
              {LINK_OPTIONS.map(o=><option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
            <button onClick={addTodo}
              style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit",flexShrink:0}}>Add</button>
            <button onClick={()=>{setShowNewTodo(false);setNewTodo("");setNewTodoLink("none");}}
              style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:13,color:t.muted}}>✕</button>
          </div>
        </div>}

        {/* Todo items */}
        <div style={{display:"flex",flexDirection:"column",gap:5}}>
          {todos.map(td=>{
            const hasLink = td.link&&td.link!=="none";
            const linkLabel = hasLink ? LINK_OPTIONS.find(o=>o.id===td.link)?.label : null;
            return <div key={td.id} style={{display:"flex",alignItems:"center",gap:10,background:t.surface,border:`1px solid ${t.border}`,borderRadius:9,padding:"9px 14px",transition:"all 0.2s"}}>
              {/* Checkbox — checking deletes the item */}
              <button onClick={()=>setTodos(p=>p.filter(x=>x.id!==td.id))}
                style={{width:18,height:18,borderRadius:4,border:`2px solid ${t.border}`,background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s",padding:0}}
                title="Mark done (removes from list)">
              </button>
              {/* Task text — clickable if has a link */}
              <div style={{flex:1,minWidth:0}}>
                <div
                  onClick={hasLink?()=>navigate(td.link):undefined}
                  style={{fontSize:13,color:hasLink?t.accentText:t.text,cursor:hasLink?"pointer":"default",fontWeight:hasLink?500:400,lineHeight:1.4}}
                  onMouseEnter={e=>{if(hasLink)e.currentTarget.style.textDecoration="underline";}}
                  onMouseLeave={e=>{e.currentTarget.style.textDecoration="none";}}>
                  {td.text}
                </div>
                {hasLink&&<div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:2}}>→ {linkLabel}</div>}
              </div>
              {/* Delete */}
              <button onClick={()=>setTodos(p=>p.filter(x=>x.id!==td.id))}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:t.faint,padding:0,lineHeight:1,opacity:0,transition:"opacity 0.1s",flexShrink:0}}
                onMouseEnter={e=>e.currentTarget.style.opacity="1"}
                onMouseLeave={e=>e.currentTarget.style.opacity="0"}>✕</button>
            </div>;
          })}
          {todos.length===0&&<div style={{fontSize:13,color:t.faint,padding:"8px 0"}}>Nothing to do — enjoy it!</div>}
        </div>
      </div>;
    })()}

    {/* ── Alerts ── */}
    {(()=>{
      const now=Date.now();
      const visible=alerts.filter(a=>{
        if(dismissedAlerts.has(a.id)) return false;
        if(snoozedAlerts[a.id]&&snoozedAlerts[a.id]>now) return false;
        return true;
      });
      if(visible.length===0) return null;
      return <AlertsSection
        visible={visible} interns={interns} t={t}
        onNavigate={onNavigate} onSelectIntern={onSelectIntern}
        todos={todos} setTodos={setTodos}
        dismissedAlerts={dismissedAlerts} setDismissedAlerts={setDismissedAlerts}
        snoozedAlerts={snoozedAlerts} setSnoozedAlerts={setSnoozedAlerts}
      />;
    })()}

    <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
      {[{id:"all",name:"All"},...lists].map(l=><button key={l.id} onClick={()=>setActiveList(l.id)} style={{background:activeList===l.id?(l.colorLight||t.accentLight):"none",color:activeList===l.id?(l.color||t.accent):t.muted,border:`1px solid ${activeList===l.id?(l.color||t.accent)+"60":t.border}`,borderRadius:20,padding:"5px 16px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{l.name}</button>)}
      {inactive.length>0&&<button onClick={()=>setShowInactive(v=>!v)} style={{marginLeft:"auto",background:showInactive?t.accentLight:"none",color:showInactive?t.accentText:t.muted,border:`1px solid ${showInactive?t.accentMid:t.border}`,borderRadius:8,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{showInactive?"▾ ":"▸ "}{inactive.length} inactive</button>}
    </div>

    {sections.map(sec=><div key={sec.id} style={{marginBottom:30}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:sec.collapsed?0:14,cursor:"pointer"}} onClick={()=>toggleSec(sec.id)}>
        <div style={{fontFamily:"inherit",fontSize:18,fontWeight:400,color:t.text,letterSpacing:"-0.01em"}}>{sec.label}</div>
        <span style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{sec.collapsed?"▸":"▾"}</span>
      </div>
      {!sec.collapsed&&sec.id==="reminders"&&<DeadlineAlertsPanel T={t} interns={interns} groups={groups}/>}
      {!sec.collapsed&&sec.id==="quickactions"&&(()=>{
        const sh = t.shades || [t.accentLight,t.accentMid,t.accentMid,t.accent,t.accentText,t.accentText];
        const btnBgLight  = t.isGradient ? t.accentLight : sh[0];
        const btnBgMid    = t.isGradient ? t.accentMid   : sh[1];
        const btnBgSolid  = t.isGradient ? t.accent      : sh[3];
        const btnColLight = t.isGradient ? t.accentText  : sh[4];
        const btnColDark  = t.isGradient ? t.accentText  : sh[5];

        const bgFor = (id) => id==="addintern"||id==="consult"||id==="lab" ? btnBgSolid : idx%2===0 ? btnBgLight : btnBgMid;
        const colFor= (id) => id==="addintern"||id==="consult"||id==="lab" ? "#fff" : idx%2===0 ? btnColLight : btnColDark;

        const visibleActions = (quickActionOrder||[])
          .map(id=>(allQuickActions||[]).find(a=>a.id===id))
          .filter(a=>a && !(quickActionHidden||new Set()).has(a.id));

        let idx = 0;
        return <div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:8}}>
            {visibleActions.map(a=>{
              const bg = a.id==="addintern"||a.id==="consult"||a.id==="lab" ? btnBgSolid : idx%2===0 ? btnBgLight : btnBgMid;
              const col= a.id==="addintern"||a.id==="consult"||a.id==="lab" ? "#fff" : idx%2===0 ? btnColLight : btnColDark;
              idx++;
              return <button key={a.id} onClick={()=>{
                if(a.action==="addintern") onAddIntern&&onAddIntern();
                else if(a.action==="onboard") onOpenOnboarding&&onOpenOnboarding();
                else if(["logsession","loggroup","payment","upload"].includes(a.action)) onQuickAction&&onQuickAction(a.action);
                else onNavigate&&onNavigate(a.action,null);
              }}
                style={{background:bg,color:col,border:"none",borderRadius:12,padding:"12px 18px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace",fontWeight:500,boxShadow:"0 1px 3px rgba(0,0,0,0.06)",transition:"opacity 0.1s"}}
                onMouseEnter={e=>e.currentTarget.style.opacity="0.85"}
                onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                {a.label}
              </button>;
            })}
          </div>
          <button onClick={()=>setCustomizing(c=>!c)}
            style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",padding:0}}>
            ⠿ customize quick actions
          </button>
        </div>;
      })()}
      {!sec.collapsed&&sec.id==="supervisees"&&<div style={{display:"flex",flexDirection:"column",gap:10}}>{filtered.map(intern=><InternCard key={intern.id} intern={intern} lists={lists} groups={groups} colleagues={colleagues} T={t} onClick={()=>onSelectIntern(intern)} onGroupClick={(gid)=>onNavigate("groups",gid)}/>)}</div>}
      {!sec.collapsed&&sec.id==="grplist"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>{groups.map(g=>{const members=interns.filter(i=>(i.groupIds||[]).includes(g.id));return <div key={g.id} onClick={()=>onNavigate("groups",g.id)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",cursor:"pointer",transition:"box-shadow 0.15s"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}><div style={{width:10,height:10,borderRadius:"50%",background:g.color}}/><span style={{fontFamily:"inherit",fontSize:16,color:t.text}}>{g.name}</span><Badge color={g.color} bg={g.colorLight}>{members.length}</Badge>{g.sharedWith?.length>0&&<SharedAvatars sharedWith={g.sharedWith} colleagues={colleagues||[]}/>}</div>
        <div style={{display:"flex",gap:6}}>{members.map(m=><div key={m.id} title={dn(m)} onClick={e=>{e.stopPropagation();onSelectIntern(m);}} style={{cursor:"pointer"}}><Avatar initials={m.initials} size={30} T={t}/></div>)}</div>
        {g.sessions[0]&&<div style={{fontSize:12,color:t.muted,marginTop:10}}>Last: {g.sessions[0].date}</div>}
      </div>;})} </div>}
      {!sec.collapsed&&sec.id==="sharedwithme"&&<div>{sharedInterns.length===0?<div style={{color:t.muted,fontSize:14}}>Nothing shared with you yet.</div>:sharedInterns.flatMap(intern=>(intern.sharedWith||[]).map(share=>{const col=(colleagues||[]).find(c=>c.id===share.colleagueId);if(!col)return null;return <div key={`${intern.id}-${col.id}`} onClick={()=>onSelectIntern(intern)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)"}
        onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
        <Avatar initials={col.initials} size={36} color={col.color} textColor="#fff"/>
        <div style={{flex:1}}><div style={{fontSize:13,color:t.muted,marginBottom:3}}><strong style={{color:t.text}}>{col.name}</strong> shared an intern</div><div style={{fontFamily:"inherit",fontSize:16,color:t.text,marginBottom:3}}>{dn(intern)}</div><div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{pmSum(share.perms)}</div></div>
        <RoleBadge role={intern.supervisorRole}/>
      </div>;}))}</div>}
    </div>)}
  </div>;
}

// ── Payments Page ──────────────────────────────────────────────────────────
// ── PaymentsTab — per-intern payments inside InternProfile ───────────────────
// ── DocumentsTab — file upload, preview, delete, signature pad ───────────────
// ── CasesTab ───────────────────────────────────────────────────────────────
function CasesTab({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const [cases,setCases]=useState(intern.cases||[]);
  const [editing,setEditing]=useState(null); // index or "new"
  const [form,setForm]=useState({id:"",presenting:"",sessions:0,lastStaffed:"",notes:"",status:"active"});
  const [confirmDel,setConfirmDel]=useState(null);

  const save=(updated)=>{setCases(updated);onUpdateIntern({...intern,cases:updated});};

  const openNew=()=>{
    setForm({id:`C-${String(Date.now()).slice(-4)}`,presenting:"",sessions:0,lastStaffed:TODAY(),notes:"",status:"active"});
    setEditing("new");
  };
  const openEdit=(i)=>{setForm({...cases[i]});setEditing(i);};

  const saveForm=()=>{
    if(!form.presenting.trim()) return;
    const updated=editing==="new"?[...cases,{...form,sessions:Number(form.sessions)||0}]:cases.map((c,i)=>i===editing?{...form,sessions:Number(form.sessions)||0}:c);
    save(updated);setEditing(null);
  };

  const deleteCase=(i)=>{save(cases.filter((_,idx)=>idx!==i));setConfirmDel(null);};

  const iStyle={width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"};
  const Label=({children})=><div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>{children}</div>;

  return <div>
    {/* Delete confirm */}
    {confirmDel!==null&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setConfirmDel(null)}>
      <div style={{background:t.surface,borderRadius:14,padding:"24px 28px",width:400,boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:17,color:t.text,fontWeight:500,marginBottom:8}}>Remove this case?</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:20,lineHeight:1.6}}>Case <strong>{cases[confirmDel]?.id}</strong> — {cases[confirmDel]?.presenting} will be removed from {dn(intern)}'s record. This does not affect any session notes.</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn T={t} variant="secondary" onClick={()=>setConfirmDel(null)}>Cancel</Btn>
          <button onClick={()=>deleteCase(confirmDel)} style={{background:S.red,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>Remove</button>
        </div>
      </div>
    </div>}

    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
      <div>
        <div style={{fontSize:13,color:t.muted,lineHeight:1.6}}>
          Cases are client situations {dn(intern)} brings to supervision. Track presenting concerns, session count, and your supervision notes per case.
        </div>
      </div>
      {editing===null&&<Btn T={t} small onClick={openNew}>+ Add case</Btn>}
    </div>

    {/* Add/Edit form */}
    {editing!==null&&<div style={{background:t.surface,border:`1px solid ${t.accentMid}`,borderRadius:12,padding:"18px 20px",marginBottom:16}}>
      <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:14}}>{editing==="new"?"Add case":"Edit case"}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <Label>Case ID</Label>
          <input value={form.id} onChange={e=>setForm(p=>({...p,id:e.target.value}))} placeholder="C-0042" style={iStyle}/>
        </div>
        <div>
          <Label>Sessions in supervision</Label>
          <input type="number" min="0" value={form.sessions} onChange={e=>setForm(p=>({...p,sessions:e.target.value}))} style={iStyle}/>
        </div>
      </div>
      <div style={{marginBottom:12}}>
        <Label>Presenting concern *</Label>
        <input value={form.presenting} onChange={e=>setForm(p=>({...p,presenting:e.target.value}))} placeholder="e.g. Generalized Anxiety, Trauma / PTSD, Family conflict..." style={iStyle}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <Label>Last staffed</Label>
          <input type="date" value={form.lastStaffed} onChange={e=>setForm(p=>({...p,lastStaffed:e.target.value}))} style={iStyle}/>
        </div>
        <div>
          <Label>Status</Label>
          <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} style={{...iStyle,cursor:"pointer"}}>
            <option value="active">Active</option>
            <option value="closed">Closed / Terminated</option>
            <option value="transferred">Transferred</option>
            <option value="on_hold">On hold</option>
          </select>
        </div>
      </div>
      <div style={{marginBottom:14}}>
        <Label>Supervision notes</Label>
        <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder="Clinical observations, guidance given, treatment direction, concerns..." rows={3} style={{...iStyle,resize:"vertical"}}/>
      </div>
      <div style={{display:"flex",gap:10}}>
        <Btn T={t} onClick={saveForm}>Save case</Btn>
        <Btn T={t} variant="secondary" onClick={()=>setEditing(null)}>Cancel</Btn>
      </div>
    </div>}

    {/* Case list */}
    {cases.length===0&&editing===null&&<div style={{background:t.surfaceAlt,borderRadius:12,padding:"32px",textAlign:"center",color:t.muted,fontSize:14}}>
      No cases yet — click "+ Add case" to track a client {dn(intern)} is bringing to supervision.
    </div>}
    {cases.map((c,i)=>(
      <div key={i} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 20px",marginBottom:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
          <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <Badge color={t.muted} bg={t.surfaceAlt}>{c.id}</Badge>
            <span style={{fontSize:15,color:t.text,fontWeight:500}}>{c.presenting}</span>
            {c.status&&c.status!=="active"&&<Badge color={S.amber} bg={S.amberLight}>{c.status.replace("_"," ")}</Badge>}
          </div>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>openEdit(i)}
              style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
              ✎ Edit
            </button>
            <button onClick={()=>setConfirmDel(i)}
              style={{background:"none",border:`1px solid ${S.red}30`,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:S.red,fontFamily:"'DM Mono',monospace"}}>
              ✕
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:8,marginBottom:c.notes?8:0}}>
          <Badge color={t.muted} bg={t.surfaceAlt}>{c.sessions} session{c.sessions!==1?"s":""} staffed</Badge>
          {c.lastStaffed&&<Badge color={t.muted} bg={t.surfaceAlt}>Last {c.lastStaffed}</Badge>}
        </div>
        {c.notes&&<p style={{fontSize:13,color:t.text,margin:0,lineHeight:1.7}}>{c.notes}</p>}
      </div>
    ))}
  </div>;
}

function DocumentsTab({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const [docs,setDocs]=useState(intern.documents||[]);
  const [viewing,setViewing]=useState(null);
  const [signing,setSigning]=useState(null); // doc index to sign
  const [dragging,setDragging]=useState(false);
  const [sigCanvas,setSigCanvas]=useState(null);
  const [isSigning,setIsSigning]=useState(false);
  const [sigColor,setSigColor]=useState("#1A1A2E");
  const canvasRef = React.useRef(null);
  const drawingRef = React.useRef(false);

  // Keep docs in sync with intern
  React.useEffect(()=>{ setDocs(intern.documents||[]); },[intern.id]);

  const save=(updated)=>{
    setDocs(updated);
    onUpdateIntern({...intern,documents:updated});
  };

  const guessType=(name)=>{
    const n=name.toLowerCase();
    if(n.includes("agreement")||n.includes("contract")||n.includes("supervision")) return "Agreement";
    if(n.includes("license")||n.includes("credential")) return "License";
    if(n.includes("insurance")) return "Insurance";
    if(n.includes("eval")) return "Evaluation";
    if(n.includes("resume")||n.includes("cv")) return "Resume";
    return "Document";
  };

  const processFile=(file)=>{
    if(!file) return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      const newDoc={name:file.name,date:TODAY(),type:guessType(file.name),uploadedBy:"supervisor",dataUrl:ev.target.result,mimeType:file.type,size:file.size};
      save([...docs,newDoc]);
    };
    reader.readAsDataURL(file);
  };

  const handleInput=(e)=>{ Array.from(e.target.files||[]).forEach(processFile); e.target.value=""; };

  const handleDrop=(e)=>{
    e.preventDefault();setDragging(false);
    Array.from(e.dataTransfer.files||[]).forEach(processFile);
  };

  const deleteDoc=(i)=>{ const updated=[...docs];updated.splice(i,1);save(updated); };

  const formatSize=(bytes)=>{
    if(!bytes) return "";
    if(bytes<1024) return bytes+"B";
    if(bytes<1024*1024) return (bytes/1024).toFixed(0)+"KB";
    return (bytes/1024/1024).toFixed(1)+"MB";
  };

  // ── Signature pad ──
  const startDraw=(e,canvas)=>{
    if(!canvas) return;
    drawingRef.current=true;
    const ctx=canvas.getContext("2d");
    const r=canvas.getBoundingClientRect();
    const clientX=e.touches?e.touches[0].clientX:e.clientX;
    const clientY=e.touches?e.touches[0].clientY:e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX-r.left,clientY-r.top);
  };
  const draw=(e,canvas)=>{
    if(!drawingRef.current||!canvas) return;
    e.preventDefault();
    const ctx=canvas.getContext("2d");
    const r=canvas.getBoundingClientRect();
    const clientX=e.touches?e.touches[0].clientX:e.clientX;
    const clientY=e.touches?e.touches[0].clientY:e.clientY;
    ctx.strokeStyle=sigColor;ctx.lineWidth=2.5;ctx.lineCap="round";ctx.lineJoin="round";
    ctx.lineTo(clientX-r.left,clientY-r.top);
    ctx.stroke();
  };
  const endDraw=()=>{ drawingRef.current=false; };
  const clearSig=(canvas)=>{
    if(!canvas) return;
    const ctx=canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  const applySignature=(canvas,docIdx)=>{
    if(!canvas) return;
    const sigDataUrl=canvas.toDataURL("image/png");
    const doc=docs[docIdx];
    const signedDoc={...doc,signed:true,signedDate:TODAY(),signedBy:"Alyson K.",signatureDataUrl:sigDataUrl};
    const updated=[...docs];updated[docIdx]=signedDoc;
    save(updated);
    setSigning(null);
  };

  const viewingDoc = viewing!==null ? docs[viewing] : null;
  const [bg,color]=viewingDoc?docTC(viewingDoc.type):["#eee","#555"];

  return <div>
    {/* Viewer modal — with integrated signature pad */}
    {viewingDoc&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>{setViewing(null);setSigning(null);}}>
      <div style={{background:t.surface,borderRadius:16,width:"82vw",maxWidth:900,maxHeight:"92vh",overflow:"hidden",boxShadow:"0 24px 64px rgba(0,0,0,0.2)",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${t.border}`,flexShrink:0}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:15,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{viewingDoc.name}</div>
            <div style={{fontSize:11,color:t.muted,marginTop:2,fontFamily:"'DM Mono',monospace"}}>Uploaded {viewingDoc.date} · {viewingDoc.uploadedBy}{viewingDoc.size?" · "+formatSize(viewingDoc.size):""}</div>
          </div>
          <div style={{display:"flex",gap:8,flexShrink:0,marginLeft:16}}>
            {viewingDoc.dataUrl&&<a href={viewingDoc.dataUrl} download={viewingDoc.name}
              style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.text,fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>
              ⬇ Download
            </a>}
            {!viewingDoc.signed&&<button onClick={()=>setSigning(signing===viewing?null:viewing)}
              style={{background:signing===viewing?t.accentLight:"none",border:`1px solid ${signing===viewing?t.accentMid:t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:signing===viewing?t.accentText:t.muted,fontFamily:"'DM Mono',monospace"}}>
              ✍ {signing===viewing?"Cancel signing":"Sign document"}
            </button>}
            <button onClick={()=>{setViewing(null);setSigning(null);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.muted,padding:4}}>✕</button>
          </div>
        </div>

        {/* Document preview */}
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:16}}>
          <div style={{display:"flex",justifyContent:"center",alignItems:"flex-start"}}>
            {viewingDoc.dataUrl
              ? viewingDoc.mimeType?.startsWith("image/")
                ? <img src={viewingDoc.dataUrl} alt={viewingDoc.name} style={{maxWidth:"100%",borderRadius:8}}/>
                : viewingDoc.mimeType==="application/pdf"
                  ? <iframe src={viewingDoc.dataUrl} title={viewingDoc.name} style={{width:"100%",height:"60vh",border:"none",borderRadius:8}}/>
                  : <div style={{color:t.muted,fontSize:14,padding:40,textAlign:"center"}}>Preview not available for this file type.<br/>Use the Download button to open it.</div>
              : <div style={{background:t.surfaceAlt,borderRadius:10,padding:40,textAlign:"center",width:"100%"}}>
                  <div style={{fontSize:40,marginBottom:12}}>📄</div>
                  <div style={{fontSize:15,color:t.text,marginBottom:6}}>{viewingDoc.name}</div>
                  <div style={{fontSize:13,color:t.muted}}>No preview available.</div>
                </div>}
          </div>

          {/* Inline signature pad — shown when signing */}
          {signing===viewing&&<div style={{background:t.surfaceAlt,border:`1px solid ${t.accentMid}`,borderRadius:12,padding:"18px 20px"}}>
            <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:4}}>Sign this document</div>
            <div style={{fontSize:12,color:t.muted,marginBottom:12}}>Draw your signature below, then click "Apply signature"</div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Draw your signature</div>
            <canvas ref={canvasRef}
              width={800} height={140}
              style={{border:`2px solid ${t.border}`,borderRadius:10,cursor:"crosshair",background:"#FAFAFA",touchAction:"none",width:"100%",display:"block",marginBottom:10}}
              onMouseDown={e=>startDraw(e,canvasRef.current)}
              onMouseMove={e=>draw(e,canvasRef.current)}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={e=>startDraw(e,canvasRef.current)}
              onTouchMove={e=>draw(e,canvasRef.current)}
              onTouchEnd={endDraw}
            />
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:12,color:t.muted}}>Ink color:</span>
              {["#1A1A2E","#1A3A8C","#2D5A3D","#8C1A1A"].map(c=><button key={c} onClick={()=>setSigColor(c)}
                style={{width:22,height:22,borderRadius:"50%",background:c,border:sigColor===c?`3px solid ${t.text}`:"2px solid transparent",cursor:"pointer",padding:0}}/>)}
              <button onClick={()=>clearSig(canvasRef.current)}
                style={{marginLeft:"auto",background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
                Clear
              </button>
            </div>
            <div style={{background:t.surface,borderRadius:8,padding:"10px 14px",fontSize:12,color:t.muted,marginBottom:12,lineHeight:1.5}}>
              By clicking "Apply signature" you confirm this electronic signature is legally binding and equivalent to a handwritten signature, applied on {TODAY()}.
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn T={t} onClick={()=>applySignature(canvasRef.current,signing)} style={{flex:1}}>✍ Apply signature to document</Btn>
              <Btn T={t} variant="secondary" onClick={()=>setSigning(null)}>Cancel</Btn>
            </div>
          </div>}
        </div>

        {/* Signed footer */}
        {viewingDoc.signed&&<div style={{padding:"10px 20px",borderTop:`1px solid ${t.border}`,background:t.surfaceAlt,fontSize:12,color:t.muted,display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
          ✍ Signed by {viewingDoc.signedBy} on {viewingDoc.signedDate}
          {viewingDoc.signatureDataUrl&&<img src={viewingDoc.signatureDataUrl} alt="signature" style={{height:28,marginLeft:8,border:`1px solid ${t.border}`,borderRadius:4,background:"#fff",padding:"0 6px"}}/>}
        </div>}
      </div>
    </div>}

    {/* Old separate signature pad modal — no longer needed (signing is now inline in viewer) */}

    {/* Upload area */}
    <div
      onDragOver={e=>{e.preventDefault();setDragging(true);}}
      onDragLeave={()=>setDragging(false)}
      onDrop={handleDrop}
      style={{border:`2px dashed ${dragging?t.accent:t.border}`,borderRadius:12,padding:"24px",textAlign:"center",marginBottom:18,background:dragging?t.accentLight:t.surfaceAlt,transition:"all 0.2s",cursor:"pointer"}}
      onClick={()=>document.getElementById(`doc-upload-${intern.id}`).click()}>
      <div style={{fontSize:28,marginBottom:8}}>📁</div>
      <div style={{fontSize:14,color:dragging?t.accentText:t.muted,fontWeight:500,marginBottom:4}}>{dragging?"Drop to upload":"Drag files here or click to browse"}</div>
      <div style={{fontSize:12,color:t.faint}}>PDF, Word, images, or any file type · Multiple files at once</div>
      <input id={`doc-upload-${intern.id}`} type="file" multiple accept="*/*" onChange={handleInput} style={{display:"none"}}/>
    </div>

    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
      <div style={{fontSize:13,color:t.muted}}>{docs.length} document{docs.length!==1?"s":""} on file</div>
      <label style={{background:t.isGradient?t.gradient:t.accent,backgroundSize:t.isGradient?"200% 200%":undefined,animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",display:"inline-block"}}>
        + Upload
        <input type="file" multiple accept="*/*" onChange={handleInput} style={{display:"none"}}/>
      </label>
    </div>

    {/* Document list */}
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {docs.length===0&&<div style={{background:t.surfaceAlt,borderRadius:12,padding:"32px",textAlign:"center",color:t.muted,fontSize:14}}>
        No documents yet — drag files here or click Upload above.
      </div>}
      {docs.map((d,i)=>{
        const [bg,col]=docTC(d.type);
        return <div key={i} style={{background:t.surface,border:`1px solid ${d.signed?t.accentMid:t.border}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          {d.dataUrl&&d.mimeType?.startsWith("image/")
            ? <img src={d.dataUrl} alt={d.name} style={{width:36,height:36,borderRadius:7,objectFit:"cover",flexShrink:0}}/>
            : <div style={{width:36,height:36,borderRadius:8,background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:col,fontFamily:"'DM Mono',monospace",fontWeight:700,flexShrink:0}}>{d.type.slice(0,3).toUpperCase()}</div>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,color:t.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.name}</div>
            <div style={{fontSize:11,color:t.muted,marginTop:2,fontFamily:"'DM Mono',monospace"}}>
              {d.date} · {d.uploadedBy}{d.size?" · "+formatSize(d.size):""}
              {d.signed&&<span style={{color:t.accentText,marginLeft:6}}>✍ Signed {d.signedDate}</span>}
            </div>
          </div>
          <Badge color={col} bg={bg}>{d.type}</Badge>
          <div style={{display:"flex",gap:6,flexShrink:0}}>
            <button onClick={()=>setViewing(i)}
              style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,color:t.text,fontFamily:"'DM Mono',monospace"}}>View</button>
            {!d.signed&&<button onClick={()=>{setViewing(i);setSigning(i);}}
              style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace"}}>✍ Sign</button>}
            <button onClick={()=>deleteDoc(i)}
              style={{background:"none",border:`1px solid ${S.red}30`,borderRadius:6,padding:"4px 8px",cursor:"pointer",fontSize:11,color:S.red,fontFamily:"'DM Mono',monospace"}} title="Delete">✕</button>
          </div>
        </div>;
      })}
    </div>
  </div>;
}

function PaymentsTab({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const [markingIdx,setMarkingIdx]=useState(null);
  const [markMethod,setMarkMethod]=useState("cash");
  const [markNote,setMarkNote]=useState("");
  const [showChargeModal,setShowChargeModal]=useState(false);
  const [chargeAmount,setChargeAmount]=useState(intern.billingRate||150);
  const [chargeNote,setChargeNote]=useState("");
  const [showBillingSetup,setShowBillingSetup]=useState(false);
  const [billingSchedule,setBillingSchedule]=useState(intern.billingSchedule||"monthly");
  const [billingRate,setBillingRate]=useState(intern.billingRate||150);
  const [cardOnFile,setCardOnFile]=useState(intern.cardOnFile||null);
  const [addingCard,setAddingCard]=useState(false);
  const [cardLast4,setCardLast4]=useState("");
  const [cardBrand,setCardBrand]=useState("Visa");

  const SCHEDULES=[
    {id:"per_session",label:"Per session",   desc:"Charge after each supervision session"},
    {id:"weekly",     label:"Weekly",         desc:"Fixed weekly rate"},
    {id:"biweekly",   label:"Every 2 weeks",  desc:"Charged every other week"},
    {id:"monthly",    label:"Monthly",        desc:"Fixed monthly rate"},
    {id:"custom",     label:"Custom",         desc:"You decide when to charge"},
  ];
  const METHOD_ICONS={cash:"💵",check:"📄",venmo:"💜",zelle:"⚡",paypal:"🅿",stripe:"💳",other:"●"};

  const totalOwed=(intern.payments||[]).filter(p=>p.status==="overdue").reduce((s,p)=>s+p.amount,0);
  const totalPaid=(intern.payments||[]).filter(p=>p.status==="paid").reduce((s,p)=>s+p.amount,0);

  const addCharge=()=>{
    const newPay={month:TODAY(),amount:Number(chargeAmount)||0,status:"overdue",date:"—",note:chargeNote||undefined};
    onUpdateIntern({...intern,payments:[newPay,...intern.payments],paymentStatus:"overdue"});
    setShowChargeModal(false);setChargeAmount(intern.billingRate||150);setChargeNote("");
  };

  const markPaid=(idx)=>{
    const updated={...intern,payments:(intern.payments||[]).map((p,i)=>i!==idx?p:{...p,status:"paid",date:TODAY(),receivedVia:markMethod,note:markNote||undefined})};
    const stillOwed=updated.payments.some(p=>p.status==="overdue");
    onUpdateIntern({...updated,paymentStatus:stillOwed?"overdue":"current"});
    setMarkingIdx(null);setMarkNote("");
  };

  const saveBillingSetup=()=>{
    onUpdateIntern({...intern,billingSchedule,billingRate:Number(billingRate)||0,cardOnFile});
    setShowBillingSetup(false);
  };

  const iStyle={border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none"};

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
      <StatCard T={t} label="Total paid" value={`$${totalPaid}`} color={t.accent}/>
      <StatCard T={t} label="Outstanding" value={`$${totalOwed}`} color={totalOwed>0?S.red:t.text}/>
      <StatCard T={t} label="Transactions" value={(intern.payments||[]).length}/>
    </div>

    {/* Billing setup */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showBillingSetup?14:0}}>
        <div>
          <div style={{fontSize:14,color:t.text,fontWeight:500}}>Billing setup</div>
          <div style={{fontSize:12,color:t.muted,marginTop:2}}>
            {intern.billingSchedule
              ? `${SCHEDULES.find(s=>s.id===intern.billingSchedule)?.label||intern.billingSchedule} · $${intern.billingRate||0}`
              : "No billing schedule set"}
            {intern.cardOnFile&&` · ${intern.cardOnFile.brand} ····${intern.cardOnFile.last4}`}
          </div>
        </div>
        <button onClick={()=>setShowBillingSetup(s=>!s)}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          {showBillingSetup?"✓ Save":"✎ Edit"}
        </button>
      </div>
      {showBillingSetup&&<div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Billing schedule</div>
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {SCHEDULES.map(s=><button key={s.id} onClick={()=>setBillingSchedule(s.id)}
              style={{background:billingSchedule===s.id?t.accentLight:t.surfaceAlt,color:billingSchedule===s.id?t.accentText:t.text,border:`1px solid ${billingSchedule===s.id?t.accentMid:t.border}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",textAlign:"left",fontSize:13,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${billingSchedule===s.id?t.accent:t.border}`,background:billingSchedule===s.id?t.accent:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {billingSchedule===s.id&&<span style={{width:6,height:6,borderRadius:"50%",background:"#fff"}}/>}
              </span>
              <span><strong>{s.label}</strong> — {s.desc}</span>
            </button>)}
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Rate ($)</div>
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{color:t.muted}}>$</span>
              <input type="number" value={billingRate} onChange={e=>setBillingRate(e.target.value)} style={{...iStyle,width:90}}/>
            </div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Card on file</div>
            {cardOnFile
              ? <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <span style={{fontSize:13,color:t.text}}>{cardOnFile.brand} ····{cardOnFile.last4}</span>
                  <button onClick={()=>setCardOnFile(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>Remove</button>
                </div>
              : addingCard
                ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <select value={cardBrand} onChange={e=>setCardBrand(e.target.value)} style={{...iStyle,width:90,cursor:"pointer"}}>
                      {["Visa","Mastercard","Amex","Discover"].map(b=><option key={b}>{b}</option>)}
                    </select>
                    <input value={cardLast4} onChange={e=>setCardLast4(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="Last 4" maxLength={4} style={{...iStyle,width:70}}/>
                    <button onClick={()=>{if(cardLast4.length===4){setCardOnFile({brand:cardBrand,last4:cardLast4});setAddingCard(false);setCardLast4("");}}}
                      style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Save</button>
                    <button onClick={()=>{setAddingCard(false);setCardLast4("");}} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 10px",cursor:"pointer",fontSize:12,color:t.muted}}>✕</button>
                  </div>
                : <button onClick={()=>setAddingCard(true)} style={{background:"none",border:`1px dashed ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>+ Add card</button>}
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn T={t} small onClick={saveBillingSetup}>Save setup</Btn>
          <Btn T={t} variant="secondary" small onClick={()=>setShowBillingSetup(false)}>Cancel</Btn>
        </div>
      </div>}
    </div>

    {/* Action buttons */}
    <div style={{display:"flex",gap:10}}>
      <Btn T={t} onClick={()=>setShowChargeModal(true)}>+ Add charge</Btn>
      <Btn T={t} variant="secondary" onClick={()=>{/* send reminder */}}>📧 Send reminder</Btn>
    </div>

    {/* Add charge modal */}
    {showChargeModal&&<div style={{background:t.surfaceAlt,border:`1px solid ${t.accentMid}`,borderRadius:12,padding:"16px 18px"}}>
      <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:12}}>Add a charge</div>
      <div style={{display:"flex",gap:10,marginBottom:10,alignItems:"center"}}>
        <span style={{color:t.muted}}>$</span>
        <input type="number" value={chargeAmount} onChange={e=>setChargeAmount(e.target.value)} style={{...iStyle,width:100}}/>
        <input value={chargeNote} onChange={e=>setChargeNote(e.target.value)} placeholder="Note (e.g. Individual session 3/21)" style={{...iStyle,flex:1}}/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn T={t} small onClick={addCharge}>Add charge</Btn>
        <Btn T={t} variant="secondary" small onClick={()=>setShowChargeModal(false)}>Cancel</Btn>
      </div>
    </div>}

    {/* Transaction list */}
    <div>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Transaction history</div>
      {(intern.payments||[]).length===0&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:"24px",textAlign:"center",color:t.muted,fontSize:14}}>No transactions yet</div>}
      {(intern.payments||[]).map((p,i)=>{
        const isMarking=markingIdx===i;
        return <div key={i} style={{background:t.surface,border:`1px solid ${p.status==="overdue"?t.accentMid:t.border}`,borderLeft:p.status==="overdue"?`3px solid ${t.accent}`:"none",borderRadius:12,padding:"14px 18px",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{p.month||p.date||"—"}</div>
              {p.note&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>{p.note}</div>}
              {p.receivedVia&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>Received via {METHOD_ICONS[p.receivedVia]} {p.receivedVia}</div>}
            </div>
            <div style={{fontSize:18,color:t.text,fontFamily:"'DM Mono',monospace",fontWeight:600}}>${p.amount}</div>
            {p.status==="paid"
              ? <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <Badge color={t.accentText} bg={t.accentLight}>✓ Paid</Badge>
                  <button onClick={()=>{const u={...intern,payments:(intern.payments||[]).map((px,ix)=>ix!==i?px:{...px,status:"overdue",date:"—",receivedVia:undefined,note:undefined})};onUpdateIntern({...u,paymentStatus:"overdue"});}}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>Undo</button>
                </div>
              : <div>
                  {!isMarking
                    ? <Btn T={t} small onClick={()=>setMarkingIdx(i)}>Mark received</Btn>
                    : <div style={{background:t.surfaceAlt,borderRadius:10,padding:"10px 12px",marginTop:8,minWidth:200}}>
                        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Received via</div>
                        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                          {Object.keys(METHOD_ICONS).map(m=><button key={m} onClick={()=>setMarkMethod(m)}
                            style={{background:markMethod===m?t.accentLight:"none",color:markMethod===m?t.accentText:t.muted,border:`1px solid ${markMethod===m?t.accentMid:t.border}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                            {METHOD_ICONS[m]} {m}
                          </button>)}
                        </div>
                        <input value={markNote} onChange={e=>setMarkNote(e.target.value)} placeholder="Optional note..." style={{...iStyle,width:"100%",marginBottom:8,boxSizing:"border-box"}}/>
                        <div style={{display:"flex",gap:6}}>
                          <Btn T={t} small onClick={()=>markPaid(i)}>✓ Confirm paid</Btn>
                          <Btn T={t} variant="secondary" small onClick={()=>{setMarkingIdx(null);setMarkNote("");}}>Cancel</Btn>
                        </div>
                      </div>}
                </div>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

function PaymentsPage({interns,groups,onSelectIntern,T}) {
  const t=T||THEMES.sage;
  const [period,setPeriod]=useState("all");
  const [view,setView]=useState("all"); // "all" | "byIntern" | "byGroup"
  const [selectedId,setSelectedId]=useState(null); // internId or groupId

  const periods=[{id:"all",label:"All time"},{id:"Q1 2026",label:"Q1 2026"},{id:"Q4 2025",label:"Q4 2025"},{id:"2026",label:"2026"},{id:"2025",label:"2025"}];
  const billableInterns=interns.filter(i=>!i.proBono);

  // Get payments for the current view
  const getPayments=(internList)=>internList.flatMap(intern=>
    intern.payments
      .filter(p=>period==="all"||p.quarter?.includes(period)||p.quarter?.startsWith(period.substring(0,4)))
      .map(p=>({...p,internName:dn(intern),internId:intern.id,credential:intern.credential,internObj:intern}))
  );

  const allP = view==="all"
    ? getPayments(billableInterns)
    : view==="byIntern" && selectedId
      ? getPayments(billableInterns.filter(i=>i.id===selectedId))
      : view==="byGroup" && selectedId
        ? getPayments(billableInterns.filter(i=>i.groupIds?.includes(selectedId)))
        : getPayments(billableInterns);

  const totalRec=allP.filter(p=>p.status==="paid").reduce((s,p)=>s+p.amount,0);
  const totalOut=allP.filter(p=>p.status==="overdue").reduce((s,p)=>s+p.amount,0);

  const buildCSV=()=>{
    const rows=[["Intern","Credential","Month","Amount","Status","Date Paid","Method","Note"]];
    allP.forEach(p=>rows.push([p.internName,p.credential,p.month||"",`$${p.amount}`,p.status,p.date||"",p.receivedVia||"",p.note||""]));
    return rows;
  };

  const methodIcons={cash:"💵",check:"📄",venmo:"💜",zelle:"⚡",paypal:"🅿",stripe:"💳",other:"●"};

  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Payments</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>Track and export supervision fees</p>
      </div>
      <Btn T={t} variant="soft" onClick={()=>downloadCSV(buildCSV(),`SupTrack_Payments_${period}.csv`)}>↓ Export CSV</Btn>
    </div>

    {/* View toggle — All / By Intern / By Group */}
    <div style={{display:"flex",gap:0,border:`1px solid ${t.border}`,borderRadius:10,overflow:"hidden",marginBottom:16,alignSelf:"flex-start",width:"fit-content"}}>
      {[["all","All payments"],["byIntern","By intern"],["byGroup","By group"]].map(([id,label],i)=>(
        <button key={id} onClick={()=>{setView(id);setSelectedId(null);}}
          style={{background:view===id?t.accentLight:"none",color:view===id?t.accentText:t.muted,border:"none",borderRight:i<2?`1px solid ${t.border}`:"none",padding:"8px 18px",cursor:"pointer",fontSize:13,fontFamily:"'DM Mono',monospace",transition:"all 0.1s"}}>
          {label}
        </button>
      ))}
    </div>

    {/* Intern picker */}
    {view==="byIntern"&&<div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Select intern</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {billableInterns.map(i=>(
          <button key={i.id} onClick={()=>setSelectedId(i.id)}
            style={{background:selectedId===i.id?t.accentLight:t.surfaceAlt,color:selectedId===i.id?t.accentText:t.muted,border:`1px solid ${selectedId===i.id?t.accentMid:t.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
            <Avatar initials={i.initials} size={20} T={t}/>
            {dn(i)}
            {i.paymentStatus==="overdue"&&<span style={{fontSize:10,color:S.red}}>⚠</span>}
          </button>
        ))}
      </div>
    </div>}

    {/* Group picker */}
    {view==="byGroup"&&<div style={{marginBottom:14}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Select group</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        {groups.map(g=>(
          <button key={g.id} onClick={()=>setSelectedId(g.id)}
            style={{background:selectedId===g.id?g.colorLight:t.surfaceAlt,color:selectedId===g.id?g.color:t.muted,border:`1px solid ${selectedId===g.id?g.color+"60":t.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:g.color}}/>
            {g.name}
            <span style={{fontSize:11,color:t.faint}}>({billableInterns.filter(i=>i.groupIds?.includes(g.id)).length})</span>
          </button>
        ))}
        {groups.length===0&&<span style={{fontSize:13,color:t.faint}}>No groups yet</span>}
      </div>
    </div>}

    {/* Period filter */}
    <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
      {periods.map(p=>(
        <button key={p.id} onClick={()=>setPeriod(p.id)}
          style={{background:period===p.id?t.accentLight:"none",color:period===p.id?t.accentText:t.muted,border:`1px solid ${period===p.id?t.accentMid:t.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
          {p.label}
        </button>
      ))}
    </div>

    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:24}}>
      <StatCard T={t} label="Total received" value={`$${totalRec.toLocaleString()}`} color={t.accent}/>
      <StatCard T={t} label="Outstanding" value={`$${totalOut.toLocaleString()}`} color={totalOut>0?S.red:t.text}/>
      <StatCard T={t} label="Transactions" value={allP.filter(p=>p.status==="paid").length} sub="payments received"/>
    </div>

    {/* By-intern summary — when viewing all or by group, show per-intern breakdown */}
    {(view==="all"||(view==="byGroup"&&selectedId))&&billableInterns.length>0&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",marginBottom:20}}>
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:12}}>Per-intern summary</div>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        {(view==="byGroup"&&selectedId
          ? billableInterns.filter(i=>i.groupIds?.includes(selectedId))
          : billableInterns
        ).map((intern,i,arr)=>{
          const internP=intern.payments.filter(p=>period==="all"||p.quarter?.includes(period)||p.quarter?.startsWith(period.substring(0,4)));
          const paid=internP.filter(p=>p.status==="paid").reduce((s,p)=>s+p.amount,0);
          const owed=internP.filter(p=>p.status==="overdue").reduce((s,p)=>s+p.amount,0);
          return <div key={intern.id} onClick={()=>{setView("byIntern");setSelectedId(intern.id);}}
            style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderTop:i>0?`1px solid ${t.borderLight}`:"none",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <Avatar initials={intern.initials} size={28} T={t}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,color:t.text,fontWeight:500}}>{dn(intern)}</div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.credential}</div>
            </div>
            <div style={{textAlign:"right"}}>
              {paid>0&&<div style={{fontSize:13,color:t.accentText,fontFamily:"'DM Mono',monospace"}}>${paid} paid</div>}
              {owed>0&&<div style={{fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>⚠ ${owed} owed</div>}
              {paid===0&&owed===0&&<div style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>No activity</div>}
            </div>
            <span style={{fontSize:12,color:t.faint}}>›</span>
          </div>;
        })}
      </div>
    </div>}

    {/* Transaction list */}
    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>
      {allP.length} transaction{allP.length!==1?"s":""}
      {view==="byIntern"&&selectedId&&` · ${dn(billableInterns.find(i=>i.id===selectedId)||{name:"?"})}`}
      {view==="byGroup"&&selectedId&&` · ${groups.find(g=>g.id===selectedId)?.name||"?"}`}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {allP.length===0&&<div style={{background:t.surfaceAlt,borderRadius:12,padding:"32px",textAlign:"center",color:t.muted,fontSize:14}}>
        No payments{period!=="all"?` in ${period}`:""}.
        {(view==="byIntern"||view==="byGroup")&&!selectedId&&<div style={{fontSize:12,color:t.faint,marginTop:6}}>Select an intern or group above to filter.</div>}
      </div>}
      {allP.map((p,i)=>(
        <div key={i} style={{background:t.surface,border:`1px solid ${p.status==="overdue"?t.accentMid:t.border}`,borderLeft:p.status==="overdue"?`3px solid ${t.accent}`:"none",borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:13,color:t.text}}>
              {p.month||"—"}{view!=="byIntern"&&<span> — <span onClick={()=>onSelectIntern(p.internObj)} style={{color:t.accent,cursor:"pointer"}}>{p.internName}</span></span>}
            </div>
            <div style={{display:"flex",gap:6,marginTop:3,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{p.credential}</span>
              {p.receivedVia&&<Badge color={t.muted} bg={t.surfaceAlt}>{methodIcons[p.receivedVia]} {p.receivedVia}</Badge>}
              {p.note&&<span style={{fontSize:11,color:t.faint,fontStyle:"italic"}}>"{p.note}"</span>}
            </div>
          </div>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:16,color:t.text,fontWeight:600}}>${p.amount}</span>
          <Badge color={p.status==="paid"?t.accentText:S.red} bg={p.status==="paid"?t.accentLight:S.redLight}>
            {p.status==="paid"?"✓ Paid":"Overdue"}
          </Badge>
        </div>
      ))}
    </div>
  </div>;
}

// ── Groups Page ────────────────────────────────────────────────────────────
function SessionLogForm({T,ag,members,newNotes,setNewNotes,setGroups,selected,setShowNewSess,updateInterns}) {
  const t=T||THEMES.sage;
  const [attendees,setAttendees]=useState(members.map(m=>m.id));
  // Per-intern charge amounts — pre-populated from group rate, individually editable
  const [charges,setCharges]=useState(()=>{
    const init={};
    members.forEach(m=>{ init[m.id]=ag.sessionRate||0; });
    return init;
  });

  const toggleAll=()=>{
    if(attendees.length===members.length) setAttendees([]);
    else setAttendees(members.map(m=>m.id));
  };

  const totalCharge=attendees.reduce((s,id)=>s+(Number(charges[id])||0),0);

  const save=()=>{
    const date=TODAY();
    const session={date,notes:newNotes,author:"Alyson",attendees:[...attendees],chargedPerSession:ag.chargePerSession,chargeAmount:ag.sessionRate||0};
    // Charge all attendees at their individual rate in one shot
    if(ag.chargePerSession){
      attendees.forEach(internId=>{
        const intern=members.find(m=>m.id===internId);
        const amount=Number(charges[internId])||0;
        if(intern&&updateInterns&&amount>0){
          const charge={month:date,amount,status:"overdue",description:`${ag.name} — group session`,groupId:ag.id};
          updateInterns(internId,charge);
        }
      });
    }
    setGroups(p=>p.map(g=>g.id!==selected?g:{...g,sessions:[session,...g.sessions]}));
    setShowNewSess(false);setNewNotes("");
  };

  return <div style={{background:t.surface,border:`1px solid ${ag.color}60`,borderLeft:`3px solid ${ag.color}`,borderRadius:12,padding:"18px 20px",marginBottom:14}}>

    {/* Attendance + charge table */}
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>Attendance{ag.chargePerSession?" & charges":""}</div>
        <button onClick={toggleAll}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          {attendees.length===members.length?"Deselect all":"Select all"}
        </button>
      </div>

      {/* Header row if charging */}
      {ag.chargePerSession&&<div style={{display:"grid",gridTemplateColumns:"1fr auto auto",gap:8,padding:"6px 10px",background:t.surfaceAlt,borderRadius:"8px 8px 0 0",marginBottom:0}}>
        <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>Intern</div>
        <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",minWidth:80,textAlign:"right"}}>Charge</div>
        <div style={{width:24}}/>
      </div>}

      <div style={{border:`1px solid ${t.border}`,borderRadius:ag.chargePerSession?"0 0 10px 10px":"10px",overflow:"hidden"}}>
        {members.map((m,i)=>{
          const present=attendees.includes(m.id);
          return <div key={m.id}
            style={{display:"grid",gridTemplateColumns:ag.chargePerSession?"1fr auto auto":"1fr auto",gap:8,padding:"10px 14px",borderTop:i>0?`1px solid ${t.borderLight}`:"none",background:present?`${t.accentLight}80`:"transparent",alignItems:"center",transition:"background 0.1s"}}>
            {/* Name + toggle */}
            <button onClick={()=>setAttendees(p=>present?p.filter(id=>id!==m.id):[...p,m.id])}
              style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",padding:0,textAlign:"left"}}>
              <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${present?t.accent:t.border}`,background:present?t.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.1s"}}>
                {present&&<span style={{color:"#fff",fontSize:12,lineHeight:1}}>✓</span>}
              </div>
              <Avatar initials={m.initials} size={24} T={t} photo={m.photo}/>
              <span style={{fontSize:13,color:present?t.text:t.muted,fontWeight:present?500:400}}>{dn(m)}</span>
            </button>

            {/* Editable charge amount */}
            {ag.chargePerSession&&<div style={{display:"flex",alignItems:"center",gap:4}}>
              <span style={{fontSize:12,color:t.muted}}>$</span>
              <input type="number" min="0" value={charges[m.id]||0}
                onChange={e=>setCharges(p=>({...p,[m.id]:Math.max(0,Number(e.target.value)||0)}))}
                disabled={!present}
                style={{width:72,border:`1px solid ${present?t.accentMid:t.border}`,borderRadius:6,padding:"4px 8px",fontSize:13,fontFamily:"'DM Mono',monospace",color:present?t.text:t.faint,background:present?t.bg:t.surfaceAlt,outline:"none",textAlign:"right",opacity:present?1:0.5}}/>
            </div>}

            {ag.chargePerSession&&<div style={{width:24,fontSize:11,color:present&&charges[m.id]>0?t.accentText:t.faint,fontFamily:"'DM Mono',monospace",textAlign:"center"}}>
              {present&&charges[m.id]>0?"💳":""}
            </div>}
          </div>;
        })}
      </div>

      {/* Total row */}
      {ag.chargePerSession&&attendees.length>0&&<div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:t.accentLight,borderRadius:"0 0 10px 10px",marginTop:-1}}>
        <span style={{fontSize:13,color:t.accentText,fontFamily:"'DM Mono',monospace"}}>
          {attendees.length} attending · total charge
        </span>
        <span style={{fontSize:16,color:t.accentText,fontFamily:"'DM Mono',monospace",fontWeight:700}}>
          ${totalCharge.toFixed(2)}
        </span>
      </div>}
    </div>

    <textarea value={newNotes} onChange={e=>setNewNotes(e.target.value)} placeholder="Session notes..." style={{width:"100%",minHeight:90,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",marginBottom:12}}/>

    <div style={{display:"flex",gap:10,alignItems:"center"}}>
      <Btn T={t} onClick={save}>
        {ag.chargePerSession&&attendees.length>0&&totalCharge>0
          ? `Save & charge all — $${totalCharge.toFixed(2)}`
          : "Save session"}
      </Btn>
      <Btn T={t} variant="secondary" onClick={()=>{setShowNewSess(false);setNewNotes("");}}>Cancel</Btn>
      {ag.chargePerSession&&attendees.length>0&&<span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginLeft:4}}>
        {attendees.length} intern{attendees.length!==1?"s":""} will be charged
      </span>}
    </div>
  </div>;
}


function InterneesPage({interns,groups,lists,colleagues,internFilter,setInternFilter,internSort,setInternSort,internViewMode,setInternViewMode,onSelectIntern,onGroupClick,onAddIntern,onOpenOnboarding,T}) {
  const t=T||THEMES.sage;
  const [showMode,setShowMode]=useState("active");

  const filterFn = {
    primary:   i => i.supervisorRole==="primary",
    secondary: i => i.supervisorRole==="secondary",
    student:   i => i.discipline==="student",
    licensed:  i => i.discipline!=="student" && i.discipline!=="sos",
    sos:       i => i.discipline==="sos",
    flagged:   i => activeFlags(i).length>0,
  }[internFilter] || (() => true);

  const statusFiltered = interns.filter(i =>
    showMode==="active"   ? i.status==="active" :
    showMode==="inactive" ? i.status==="inactive" :
    true
  );
  const filtered = statusFiltered.filter(filterFn);
  const filterLabel = {primary:"Primary Interns",secondary:"Secondary Interns",student:"Student Interns",licensed:"State Licensed",sos:"Supervision of Supervision",flagged:"Flagged"}[internFilter];
  const activeCount   = interns.filter(i=>i.status==="active").length;
  const inactiveCount = interns.filter(i=>i.status==="inactive").length;

  const SORT_OPTIONS = [
    { id:"group",          label:"By group" },
    { id:"alpha_az",       label:"Alphabetical A → Z" },
    { id:"alpha_za",       label:"Alphabetical Z → A" },
    { id:"discipline",     label:"By discipline / intern type" },
    { id:"role",           label:"By supervisory role" },
    { id:"hours_most",     label:"Hours — most to least" },
    { id:"hours_least",    label:"Hours — least to most" },
    { id:"hours_pct_most", label:"% complete — highest first" },
    { id:"hours_pct_least",label:"% complete — lowest first" },
    { id:"start_newest",   label:"Start date — newest first" },
    { id:"start_oldest",   label:"Start date — oldest first" },
    { id:"payment",        label:"Payment status — overdue first" },
    { id:"flags",          label:"Flagged — most flags first" },
    { id:"list",           label:"By list" },
  ];

  let sections = [];
  const makeSection = (name, color, colorLight, internList) => ({
    name, color: color||t.faint, colorLight: colorLight||t.surfaceAlt,
    interns: internList.sort((a,b)=>dn(a).localeCompare(dn(b)))
  });

  if (internSort==="group") {
    const map = {};
    filtered.forEach(i => {
      const g = groups.find(g=>i.groupIds?.includes(g.id));
      const key = g ? g.name : "No Group";
      if (!map[key]) map[key] = { name:key, color:g?.color||t.faint, colorLight:g?.colorLight||t.surfaceAlt, interns:[] };
      map[key].interns.push(i);
    });
    Object.values(map).forEach(s=>s.interns.sort((a,b)=>dn(a).localeCompare(dn(b))));
    sections = Object.values(map).sort((a,b)=>a.name==="No Group"?1:b.name==="No Group"?-1:a.name.localeCompare(b.name));
  } else if (internSort==="alpha_az") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>dn(a).localeCompare(dn(b))) }];
  } else if (internSort==="alpha_za") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>dn(b).localeCompare(dn(a))) }];
  } else if (internSort==="discipline") {
    const map = {};
    filtered.forEach(i => {
      const disc = discStyle(i.discipline||i.internType);
      const key = disc.label;
      if (!map[key]) map[key] = { name:key, color:disc.color, colorLight:disc.bg, interns:[] };
      map[key].interns.push(i);
    });
    Object.values(map).forEach(s=>s.interns.sort((a,b)=>dn(a).localeCompare(dn(b))));
    sections = Object.values(map).sort((a,b)=>a.name.localeCompare(b.name));
  } else if (internSort==="role") {
    const roleOrder = ["primary","secondary"];
    const roleLabels = { primary:"Primary Interns", secondary:"Secondary Interns" };
    const map = {};
    filtered.forEach(i => {
      const key = i.supervisorRole;
      if (!map[key]) map[key] = { name:roleLabels[key]||key, color:key==="primary"?"#B87D2A":S.coral, colorLight:key==="primary"?"#FAF2E0":S.coralLight, interns:[] };
      map[key].interns.push(i);
    });
    Object.values(map).forEach(s=>s.interns.sort((a,b)=>dn(a).localeCompare(dn(b))));
    sections = roleOrder.filter(r=>map[r]).map(r=>map[r]);
  } else if (internSort==="hours_most") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>b.hoursCompleted-a.hoursCompleted) }];
  } else if (internSort==="hours_least") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>a.hoursCompleted-b.hoursCompleted) }];
  } else if (internSort==="hours_pct_most") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>(b.hoursCompleted/b.hoursTotal)-(a.hoursCompleted/a.hoursTotal)) }];
  } else if (internSort==="hours_pct_least") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>(a.hoursCompleted/a.hoursTotal)-(b.hoursCompleted/b.hoursTotal)) }];
  } else if (internSort==="start_newest") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>new Date(b.startDate)-new Date(a.startDate)) }];
  } else if (internSort==="start_oldest") {
    sections = [{ name:null, interns:[...filtered].sort((a,b)=>new Date(a.startDate)-new Date(b.startDate)) }];
  } else if (internSort==="payment") {
    const overdue = filtered.filter(i=>!i.proBono&&i.paymentStatus==="overdue").sort((a,b)=>dn(a).localeCompare(dn(b)));
    const current = filtered.filter(i=>i.proBono||i.paymentStatus!=="overdue").sort((a,b)=>dn(a).localeCompare(dn(b)));
    sections = [
      ...(overdue.length?[{ name:"Overdue", color:S.red, colorLight:S.redLight, interns:overdue }]:[]),
      ...(current.length?[{ name:"Current / Pro Bono", color:S.green, colorLight:S.greenLight, interns:current }]:[]),
    ];
  } else if (internSort==="flags") {
    const flagged = filtered.filter(i=>activeFlags(i).length>0).sort((a,b)=>activeFlags(b).length-activeFlags(a).length);
    const clean   = filtered.filter(i=>activeFlags(i).length===0).sort((a,b)=>dn(a).localeCompare(dn(b)));
    sections = [
      ...(flagged.length?[{ name:"Has open flags", color:S.amber, colorLight:S.amberLight, interns:flagged }]:[]),
      ...(clean.length  ?[{ name:"No flags", color:t.faint, colorLight:t.surfaceAlt, interns:clean }]:[]),
    ];
  } else if (internSort==="list") {
    const map = {};
    filtered.forEach(i => {
      const memberLists = lists.filter(l=>i.listIds?.includes(l.id));
      if (memberLists.length===0) {
        if (!map["No List"]) map["No List"] = { name:"No List", color:t.faint, colorLight:t.surfaceAlt, interns:[] };
        map["No List"].interns.push(i);
      } else {
        memberLists.forEach(l => {
          if (!map[l.name]) map[l.name] = { name:l.name, color:l.color, colorLight:l.colorLight, interns:[] };
          if (!map[l.name].interns.find(x=>x.id===i.id)) map[l.name].interns.push(i);
        });
      }
    });
    Object.values(map).forEach(s=>s.interns.sort((a,b)=>dn(a).localeCompare(dn(b))));
    sections = Object.values(map).sort((a,b)=>a.name==="No List"?1:b.name==="No List"?-1:a.name.localeCompare(b.name));
  }

  const showHeaders = sections.length>1||(sections.length===1&&sections[0].name);

  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:0,letterSpacing:"-0.02em"}}>Supervisees</h1>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onOpenOnboarding}
          style={{background:t.surfaceAlt,color:t.muted,border:`1px solid ${t.border}`,borderRadius:10,padding:"9px 16px",cursor:"pointer",fontSize:13,fontFamily:"'DM Mono',monospace"}}>
          Send onboarding link
        </button>
        <button onClick={onAddIntern}
          style={{background:t.accent,color:"#fff",border:"none",borderRadius:10,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit",boxShadow:`0 2px 8px ${t.accent}40`,transition:"all 0.15s"}}
          onMouseEnter={e=>e.currentTarget.style.opacity="0.9"}
          onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          + Add supervisee
        </button>
      </div>
    </div>

    {/* Toolbar */}
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,flexWrap:"wrap"}}>
      <div style={{display:"flex",border:`1px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
        {[
          {id:"active",   label:`Active (${activeCount})`},
          {id:"both",     label:"Both"},
          {id:"inactive", label:`Inactive (${inactiveCount})`},
        ].map((opt,i)=>(
          <button key={opt.id} onClick={()=>setShowMode(opt.id)}
            style={{background:showMode===opt.id?t.accentLight:"none",color:showMode===opt.id?t.accentText:t.muted,border:"none",borderRight:i<2?`1px solid ${t.border}`:"none",padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap",transition:"all 0.1s"}}>
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
        <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>Sort by</span>
        <select value={internSort} onChange={e=>setInternSort(e.target.value)}
          style={{border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 12px",fontSize:13,color:t.text,background:t.surface,outline:"none",cursor:"pointer",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
          {SORT_OPTIONS.map(opt=><option key={opt.id} value={opt.id}>{opt.label}</option>)}
        </select>
      </div>
      {filterLabel
        ? <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:13,color:t.muted}}>Showing:</span>
            <Badge color={t.accentText} bg={t.accentLight}>{filterLabel}</Badge>
            <button onClick={()=>setInternFilter(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>✕ clear</button>
          </div>
        : <span style={{fontSize:13,color:t.faint}}>{filtered.length} supervisee{filtered.length!==1?"s":""}</span>}
      <div style={{display:"flex",border:`1px solid ${t.border}`,borderRadius:8,overflow:"hidden",flexShrink:0}}>
        {[
          {id:"list",icon:"☰",title:"List view"},
          {id:"grid",icon:"⊞",title:"Grid view"},
          {id:"compact",icon:"≡",title:"Compact view"},
          {id:"table",icon:"⊟",title:"Table view"},
        ].map((v,i)=>(
          <button key={v.id} onClick={()=>setInternViewMode(v.id)} title={v.title}
            style={{background:internViewMode===v.id?t.accentLight:"none",color:internViewMode===v.id?t.accentText:t.muted,border:"none",borderRight:i<3?`1px solid ${t.border}`:"none",padding:"6px 11px",cursor:"pointer",fontSize:14,lineHeight:1,transition:"all 0.1s"}}>
            {v.icon}
          </button>
        ))}
      </div>
    </div>

    {sections.map((section,si)=>(
      <div key={section.name||si} style={{marginBottom:showHeaders?28:0}}>
        {showHeaders&&section.name&&(
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,paddingBottom:8,borderBottom:`2px solid ${section.color}30`}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:section.color,flexShrink:0}}/>
            <span style={{fontSize:12,color:section.color,fontFamily:"'DM Mono',monospace",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.06em"}}>{section.name}</span>
            <span style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{section.interns.length} supervisee{section.interns.length!==1?"s":""}</span>
          </div>
        )}
        {internViewMode==="list"&&section.interns.map(intern=>(
          <div key={intern.id} style={{marginBottom:10}}>
            <InternCard intern={intern} lists={lists} groups={groups} colleagues={colleagues} T={t} onClick={()=>onSelectIntern(intern)} onGroupClick={onGroupClick}/>
          </div>
        ))}
        {internViewMode==="grid"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:4}}>
          {section.interns.map(intern=>{
            const pct=Math.round(intern.hoursCompleted/intern.hoursTotal*100);
            const af=activeFlags(intern);
            return <div key={intern.id} onClick={()=>onSelectIntern(intern)}
              style={{background:t.surface,border:`1px solid ${af.length?t.accentMid:t.border}`,borderRadius:14,padding:"20px 20px 16px",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"all 0.15s",textAlign:"center"}}
              onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.1)";e.currentTarget.style.borderColor=t.accentMid;}}
              onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)";e.currentTarget.style.borderColor=af.length?t.accentMid:t.border;}}>
              <Avatar initials={intern.initials} size={56} T={t} photo={intern.photo} style={{margin:"0 auto 10px"}}/>
              <div style={{fontSize:15,color:t.text,fontWeight:500,marginBottom:2}}>{dn(intern)}</div>
              <div style={{fontSize:12,color:t.muted,marginBottom:10}}>{intern.credential} · {intern.licenseGoal}</div>
              <div style={{height:5,background:t.borderLight,borderRadius:999,marginBottom:6,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999}}/>
              </div>
              <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{pct}% · {intern.hoursCompleted}/{intern.hoursTotal} hrs</div>
              {af.length>0&&<div style={{marginTop:6,fontSize:11,color:t.accentText}}>⚑ {af.length} flag{af.length>1?"s":""}</div>}
              {intern.paymentStatus==="overdue"&&!intern.proBono&&<div style={{marginTop:4,fontSize:11,color:t.accentText}}>⚠ Payment overdue</div>}
            </div>;
          })}
        </div>}
        {internViewMode==="compact"&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",marginBottom:4}}>
          {section.interns.map((intern,i)=>{
            const pct=Math.round(intern.hoursCompleted/intern.hoursTotal*100);
            const af=activeFlags(intern);
            return <div key={intern.id} onClick={()=>onSelectIntern(intern)}
              style={{display:"flex",alignItems:"center",gap:12,padding:"10px 16px",borderTop:i>0?`1px solid ${t.borderLight}`:"none",cursor:"pointer",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <Avatar initials={intern.initials} size={28} T={t} photo={intern.photo}/>
              <div style={{flex:1,minWidth:0}}>
                <span style={{fontSize:13,color:t.text,fontWeight:500}}>{dn(intern)}</span>
                <span style={{fontSize:12,color:t.faint,marginLeft:8,fontFamily:"'DM Mono',monospace"}}>{intern.credential}</span>
              </div>
              <div style={{width:80,height:4,background:t.borderLight,borderRadius:999,flexShrink:0}}>
                <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999}}/>
              </div>
              <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",minWidth:36,textAlign:"right"}}>{pct}%</span>
              {af.length>0&&<span style={{fontSize:11,color:t.accentText}}>⚑</span>}
              {intern.paymentStatus==="overdue"&&!intern.proBono&&<span style={{fontSize:11,color:t.accentText}}>⚠</span>}
              <span style={{color:t.faint,fontSize:12}}>›</span>
            </div>;
          })}
        </div>}
        {internViewMode==="table"&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",marginBottom:4}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 0.8fr",background:t.surfaceAlt,padding:"8px 16px",borderBottom:`1px solid ${t.border}`}}>
            {["Name","Credential","Hours","Progress","Role","Status"].map(h=><div key={h} style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em"}}>{h}</div>)}
          </div>
          {section.interns.map((intern,i)=>{
            const pct=Math.round(intern.hoursCompleted/intern.hoursTotal*100);
            return <div key={intern.id} onClick={()=>onSelectIntern(intern)}
              style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 0.8fr",padding:"10px 16px",borderTop:i>0?`1px solid ${t.borderLight}`:"none",cursor:"pointer",alignItems:"center",transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background=t.surfaceAlt}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div style={{display:"flex",alignItems:"center",gap:8}}><Avatar initials={intern.initials} size={22} T={t} photo={intern.photo}/><span style={{fontSize:13,color:t.text,fontWeight:500}}>{dn(intern)}</span></div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.credential}</div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.hoursCompleted}/{intern.hoursTotal}</div>
              <div>
                <div style={{height:4,background:t.borderLight,borderRadius:999,overflow:"hidden",width:60}}>
                  <div style={{height:"100%",width:`${Math.min(100,pct)}%`,background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999}}/>
                </div>
                <div style={{fontSize:10,color:t.faint,marginTop:2,fontFamily:"'DM Mono',monospace"}}>{pct}%</div>
              </div>
              <div><RoleBadge role={intern.supervisorRole}/></div>
              <div style={{display:"flex",gap:4}}>
                {intern.paymentStatus==="overdue"&&!intern.proBono&&<span style={{fontSize:11,color:t.accentText}} title="Payment overdue">⚠</span>}
                {activeFlags(intern).length>0&&<span style={{fontSize:11,color:t.accentText}} title={`${activeFlags(intern).length} open flags`}>⚑</span>}
                {intern.proBono&&<Badge color="#6B3FA0" bg="#F2EDFB">Pro bono</Badge>}
              </div>
            </div>;
          })}
        </div>}
      </div>
    ))}
  </div>;
}

function GroupsPage({groups,interns,colleagues,setColleagues,setGroups,onSelectIntern,initialGroupId,updateInterns,updateIntern,T}) {
  const t=T||THEMES.sage;
  const [selected,setSelected]=useState(initialGroupId||groups[0]?.id||null);
  const [showNew,setShowNew]=useState(false);
  const [newName,setNewName]=useState("");
  const [showNewSess,setShowNewSess]=useState(false);
  const [newNotes,setNewNotes]=useState("");
  const [shareOpen,setShareOpen]=useState(false);
  const [aiGroupOpen,setAiGroupOpen]=useState(false);
  const [editingGroup,setEditingGroup]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState(false);

  const GROUP_COLORS = [
    {color:t.accent,     light:t.accentLight,  label:"Accent"},
    {color:S.blue,       light:S.blueLight,    label:"Blue"},
    {color:S.purple,     light:S.purpleLight,  label:"Purple"},
    {color:S.amber,      light:S.amberLight,   label:"Amber"},
    {color:S.teal,       light:S.tealLight,    label:"Teal"},
    {color:S.coral,      light:S.coralLight,   label:"Coral"},
    {color:"#2D5A3D",    light:"#E4F2E8",      label:"Forest"},
    {color:"#8B6BB1",    light:"#F0EBF9",      label:"Lavender"},
    {color:"#C4607A",    light:"#FCE8F0",      label:"Rose"},
    {color:"#1A8A8A",    light:"#E0F5F5",      label:"Teal Deep"},
  ];

  const gC  = GROUP_COLORS.map(c=>c.color);
  const gCL = GROUP_COLORS.map(c=>c.light);
  const ag=groups.find(g=>g.id===selected);
  const members=ag?interns.filter(i=>(i.groupIds||[]).includes(ag.id)):[];

  const addGroup=()=>{
    if(!newName.trim())return;
    const idx=groups.length%gC.length;
    setGroups(p=>[...p,{id:`g${Date.now()}`,name:newName.trim(),color:gC[idx],colorLight:gCL[idx],sharedWith:[],sessions:[]}]);
    setNewName("");setShowNew(false);
  };

  const deleteGroup=()=>{
    // Remove group from all interns
    const id=selected;
    setGroups(p=>p.filter(g=>g.id!==id));
    // Remove groupId from all interns who had it
    // (handled via updateInterns is not available here, but we can do it via setGroups side effect)
    setSelected(groups.filter(g=>g.id!==id)[0]?.id||null);
    setConfirmDelete(false);
    setEditingGroup(false);
  };

  const [groupDragIdx,setGroupDragIdx]=useState(null);
  const [groupDragOver,setGroupDragOver]=useState(null);

  const onGroupDrop=(i)=>{
    if(groupDragIdx===null||groupDragIdx===i) return;
    const arr=[...groups];
    const [moved]=arr.splice(groupDragIdx,1);
    arr.splice(i,0,moved);
    setGroups(arr);
    setGroupDragIdx(null);setGroupDragOver(null);
  };

  const toggleMember=(internId)=>{
    const intern=interns.find(i=>i.id===internId);
    if(!intern||!updateIntern) return;
    const inGroup=intern.groupIds?.includes(selected);
    const newGroupIds=inGroup
      ? intern.groupIds.filter(id=>id!==selected)
      : [...(intern.groupIds||[]),selected];
    updateIntern({...intern,groupIds:newGroupIds});
  };

  const logSess=()=>{if(!newNotes.trim()||!selected)return;setGroups(p=>p.map(g=>g.id!==selected?g:{...g,sessions:[{date:TODAY(),duration:"90 min",attendees:members.map(m=>m.id),author:"Alyson",notes:newNotes.trim()},...g.sessions]}));setNewNotes("");setShowNewSess(false);};

  return <div>
    {shareOpen&&ag&&<ShareModal T={t} title={ag.name} sharedWith={ag.sharedWith||[]} colleagues={colleagues} setColleagues={setColleagues} onSave={s=>{setGroups(p=>p.map(g=>g.id!==selected?g:{...g,sharedWith:s}));setShareOpen(false);}} onClose={()=>setShareOpen(false)}/>}
    {aiGroupOpen&&ag&&<AISessionModal T={t} groupContext={ag} intern={null} onSave={session=>{setGroups(p=>p.map(g=>g.id!==selected?g:{...g,sessions:[{...session,attendees:members.map(m=>m.id)},...g.sessions]}));setAiGroupOpen(false);}} onClose={()=>setAiGroupOpen(false)}/>}

    {/* Delete confirm modal */}
    {confirmDelete&&ag&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setConfirmDelete(false)}>
      <div style={{background:t.surface,borderRadius:16,padding:"28px 32px",width:400,boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:8}}>Delete "{ag.name}"?</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:20,lineHeight:1.6}}>This will permanently delete the group and all {(ag.sessions||[]).length} session{(ag.sessions||[]).length!==1?"s":""} logged for it. Members won't be deleted — they'll just be removed from this group. This cannot be undone.</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <Btn T={t} variant="secondary" onClick={()=>setConfirmDelete(false)}>Cancel</Btn>
          <button onClick={deleteGroup} style={{background:S.red,color:"#fff",border:"none",borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:500}}>Delete group</button>
        </div>
      </div>
    </div>}

    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
      <div><h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Supervision Groups</h1><p style={{color:t.muted,fontSize:14,margin:0}}>Log group sessions and manage membership</p></div>
      <Btn T={t} onClick={()=>setShowNew(true)}>+ New Group</Btn>
    </div>

    {showNew&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",marginBottom:20}}>
      <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:10}}>Name your group</div>
      <div style={{display:"flex",gap:10}}>
        <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Thursday Afternoon Group" onKeyDown={e=>e.key==="Enter"&&addGroup()} style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none"}}/>
        <Btn T={t} onClick={addGroup}>Create</Btn>
        <Btn T={t} variant="secondary" onClick={()=>{setShowNew(false);setNewName("");}}>Cancel</Btn>
      </div>
    </div>}

    <div style={{display:"flex",gap:20}}>
      {/* Group list sidebar — drag to reorder */}
      <div style={{width:200,flexShrink:0}}>
        <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6,paddingLeft:4}}>⠿ drag to reorder</div>
        {groups.map((g,i)=><div key={g.id}
          draggable
          onDragStart={()=>setGroupDragIdx(i)}
          onDragOver={e=>{e.preventDefault();setGroupDragOver(i);}}
          onDrop={()=>onGroupDrop(i)}
          onDragEnd={()=>{setGroupDragIdx(null);setGroupDragOver(null);}}
        >
          <button onClick={()=>{setSelected(g.id);setEditingGroup(false);setShowNewSess(false);}}
            style={{width:"100%",background:groupDragOver===i?t.accentLight:selected===g.id?g.colorLight:"none",border:selected===g.id?`1px solid ${g.color}50`:groupDragOver===i?`1px solid ${t.accentMid}`:"1px solid transparent",borderRadius:10,padding:"12px 14px",cursor:"pointer",textAlign:"left",marginBottom:6,transition:"all 0.1s",opacity:groupDragIdx===i?0.5:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:t.faint,fontSize:11,cursor:"grab"}}>⠿</span>
              <div style={{width:8,height:8,borderRadius:"50%",background:g.color,flexShrink:0}}/>
              <span style={{fontSize:14,color:t.text,fontWeight:selected===g.id?500:400}}>{g.name}</span>
            </div>
            <div style={{fontSize:12,color:t.muted,marginTop:4,paddingLeft:24}}>{interns.filter(i=>(i.groupIds||[]).includes(g.id)).length} members · {g.sessions.length} sessions</div>
            {g.sharedWith?.length>0&&<div style={{paddingLeft:24,marginTop:4}}><SharedAvatars sharedWith={g.sharedWith} size={18} colleagues={colleagues||[]}/></div>}
          </button>
        </div>)}
        {groups.length===0&&<div style={{fontSize:13,color:t.faint,padding:"12px 0"}}>No groups yet</div>}
      </div>

      {ag&&<div style={{flex:1}}>
        {/* Group header card — with edit mode */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          {editingGroup
            ? <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Edit group</div>
                {/* Name */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:12,color:t.muted,marginBottom:6}}>Group name</div>
                  <input value={ag.name} onChange={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,name:e.target.value}))}
                    style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 14px",fontSize:15,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
                </div>
                {/* Color picker */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:t.muted,marginBottom:8}}>Group color</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {GROUP_COLORS.map(c=>(
                      <button key={c.color} onClick={()=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,color:c.color,colorLight:c.light}))}
                        style={{width:28,height:28,borderRadius:"50%",background:c.color,border:ag.color===c.color?`3px solid ${t.text}`:`2px solid transparent`,cursor:"pointer",transition:"border 0.1s"}}
                        title={c.label}/>
                    ))}
                  </div>
                </div>
                {/* Member management */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,color:t.muted,marginBottom:8}}>Members — click to add or remove</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {interns.filter(i=>i.status==="active").map(i=>{
                      const inGroup=i.groupIds?.includes(selected);
                      return <button key={i.id} onClick={()=>toggleMember(i.id)}
                        style={{display:"flex",alignItems:"center",gap:6,background:inGroup?ag.colorLight:t.surfaceAlt,color:inGroup?ag.color:t.muted,border:`1px solid ${inGroup?ag.color+"60":t.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:13,transition:"all 0.1s"}}>
                        <Avatar initials={i.initials} size={18} T={t}/>
                        {dn(i).split(" ")[0]}
                        {inGroup&&<span style={{fontSize:10,color:ag.color}}>✓</span>}
                      </button>;
                    })}
                  </div>
                </div>
                <div style={{display:"flex",gap:8,justifyContent:"space-between",alignItems:"center",paddingTop:12,borderTop:`1px solid ${t.borderLight}`}}>
                  <button onClick={()=>setConfirmDelete(true)}
                    style={{background:"none",border:`1px solid ${S.red}40`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>
                    🗑 Delete group
                  </button>
                  <Btn T={t} onClick={()=>setEditingGroup(false)}>✓ Done editing</Btn>
                </div>
              </div>
            : <div>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:12,height:12,borderRadius:"50%",background:ag.color}}/>
                    <span style={{fontFamily:"inherit",fontSize:20,color:t.text,fontWeight:500}}>{ag.name}</span>
                    {ag.sharedWith?.length>0&&<SharedAvatars sharedWith={ag.sharedWith} colleagues={colleagues||[]}/>}
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <Btn T={t} variant="secondary" small onClick={()=>setEditingGroup(true)}>✎ Edit group</Btn>
                    <Btn T={t} variant="secondary" small onClick={()=>setShareOpen(true)}>Share</Btn>
                  </div>
                </div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Members</div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  {members.map(m=><div key={m.id} onClick={()=>onSelectIntern&&onSelectIntern(m)}
                    style={{display:"flex",alignItems:"center",gap:8,background:t.surfaceAlt,borderRadius:8,padding:"7px 12px",cursor:"pointer",transition:"background 0.1s"}}
                    onMouseEnter={e=>e.currentTarget.style.background=t.accentLight}
                    onMouseLeave={e=>e.currentTarget.style.background=t.surfaceAlt}>
                    <Avatar initials={m.initials} size={26} T={t}/>
                    <span style={{fontSize:13,color:t.text}}>{dn(m)}</span>
                    {m.pronouns&&<span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{m.pronouns}</span>}
                    <RoleBadge role={m.supervisorRole}/>
                  </div>)}
                  {members.length===0&&<span style={{fontSize:13,color:t.muted}}>No members yet — click Edit group to add</span>}
                </div>
              </div>}
        </div>

        {/* Per-session charging toggle + rate */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ag.chargePerSession?12:0}}>
            <div>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>Per-session charging</div>
              <div style={{fontSize:12,color:t.muted,marginTop:2}}>Charge interns only for sessions they attend. Absent interns are not charged.</div>
            </div>
            <button onClick={()=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,chargePerSession:!g.chargePerSession}))}
              style={{background:ag.chargePerSession?t.accent:t.surfaceAlt,border:`1px solid ${ag.chargePerSession?t.accent:t.border}`,borderRadius:20,width:44,height:24,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
              <span style={{position:"absolute",top:3,left:ag.chargePerSession?22:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </button>
          </div>
          {ag.chargePerSession&&<div style={{display:"flex",alignItems:"center",gap:12,paddingTop:12,borderTop:`1px solid ${t.borderLight}`}}>
            <div style={{fontSize:13,color:t.muted}}>Rate per session:</div>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:14,color:t.muted}}>$</span>
              <input type="number" min="0" defaultValue={ag.sessionRate||0}
                onBlur={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,sessionRate:Math.max(0,Number(e.target.value))}))}
                style={{width:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
              <span style={{fontSize:12,color:t.faint}}>per intern per session</span>
            </div>
            <div style={{marginLeft:"auto",fontSize:12,color:t.accentText,background:t.accentLight,borderRadius:6,padding:"3px 10px"}}>
              Interns agree to this in their portal
            </div>
          </div>}
        </div>

        {/* Flat fee billing — off by default, toggle to enable */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:ag.flatFeeEnabled?14:0}}>
            <div>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>Flat fee billing</div>
              <div style={{fontSize:12,color:t.muted,marginTop:2}}>Set a recurring fee per intern — customize amount and frequency per person</div>
            </div>
            <button onClick={()=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,flatFeeEnabled:!g.flatFeeEnabled}))}
              style={{background:ag.flatFeeEnabled?t.accent:t.surfaceAlt,border:`1px solid ${ag.flatFeeEnabled?t.accent:t.border}`,borderRadius:20,width:44,height:24,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
              <span style={{position:"absolute",top:3,left:ag.flatFeeEnabled?22:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
            </button>
          </div>

          {ag.flatFeeEnabled&&<div>
            {/* Default rate row */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:14,padding:"12px 14px",background:t.surfaceAlt,borderRadius:10}}>
              <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Default rate</div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  <span style={{fontSize:13,color:t.muted}}>$</span>
                  <input type="number" min="0" defaultValue={ag.paymentPerIntern||0}
                    onBlur={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,paymentPerIntern:Number(e.target.value)}))}
                    style={{width:70,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 8px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Default frequency</div>
                <select defaultValue={ag.feeFrequency||"monthly"}
                  onChange={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,feeFrequency:e.target.value}))}
                  style={{border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 10px",fontSize:12,color:t.text,background:t.bg,outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
                  {["weekly","biweekly","monthly","per session","per semester"].map(f=><option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Your share (%)</div>
                <input type="number" min="0" max="100" defaultValue={ag.split||100}
                  onBlur={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,split:Math.min(100,Math.max(0,Number(e.target.value)))}))}
                  style={{width:60,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 8px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
              </div>
            </div>

            {/* Per-intern overrides */}
            {members.length>0&&<div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Per-intern billing — override defaults individually</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {members.map(m=>{
                  const override=(ag.internBilling||{})[m.id]||{};
                  const amt=override.amount!=null?override.amount:(ag.paymentPerIntern||0);
                  const freq=override.frequency||ag.feeFrequency||"monthly";
                  return <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
                    <Avatar initials={m.initials} size={24} T={t}/>
                    <span style={{fontSize:13,color:t.text,flex:1}}>{dn(m).split(" ")[0]}</span>
                    <span style={{fontSize:12,color:t.muted}}>$</span>
                    <input type="number" min="0" value={amt}
                      onChange={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,internBilling:{...(g.internBilling||{}),[m.id]:{...(g.internBilling?.[m.id]||{}),amount:Number(e.target.value)}}}))}
                      style={{width:64,border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 6px",fontSize:12,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none",textAlign:"right"}}/>
                    <span style={{fontSize:12,color:t.muted}}>/</span>
                    <select value={freq}
                      onChange={e=>setGroups(p=>p.map(g=>g.id!==selected?g:{...g,internBilling:{...(g.internBilling||{}),[m.id]:{...(g.internBilling?.[m.id]||{}),frequency:e.target.value}}}))}
                      style={{border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 8px",fontSize:11,color:t.text,background:t.bg,outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
                      {["weekly","biweekly","monthly","per session","per semester"].map(f=><option key={f}>{f}</option>)}
                    </select>
                  </div>;
                })}
              </div>
              <div style={{fontSize:12,color:t.muted,marginTop:8}}>
                Group total ({ag.feeFrequency||"monthly"}): <strong style={{color:t.accentText}}>${members.reduce((s,m)=>{const o=(ag.internBilling||{})[m.id];return s+(o?.amount!=null?o.amount:(ag.paymentPerIntern||0));},0).toFixed(2)}</strong>
              </div>
            </div>}
          </div>}
        </div>

        {/* ── Quick session log — prominent, always accessible ── */}
        <div style={{background:t.surface,border:`2px solid ${ag.color}40`,borderRadius:14,padding:"18px 20px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showNewSess?14:0}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:ag.color}}/>
              <span style={{fontSize:15,color:t.text,fontWeight:500}}>Log a session</span>
              <span style={{fontSize:12,color:t.muted}}>{(ag.sessions||[]).length} logged</span>
            </div>
            <div style={{display:"flex",gap:8}}>
              {!showNewSess&&<button onClick={()=>setShowNewSess(true)}
                style={{background:ag.color,color:"#fff",border:"none",borderRadius:8,padding:"7px 16px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                + Log session
              </button>}
              {!showNewSess&&<Btn T={t} small onClick={()=>setAiGroupOpen(true)}>✦ AI assist</Btn>}
              {showNewSess&&<button onClick={()=>{setShowNewSess(false);setNewNotes("");}}
                style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"inherit"}}>
                Cancel
              </button>}
            </div>
          </div>

          {showNewSess&&<SessionLogForm T={t} ag={ag} members={members} newNotes={newNotes} setNewNotes={setNewNotes} setGroups={setGroups} selected={selected} setShowNewSess={setShowNewSess} updateInterns={updateInterns}/>}
        </div>

        {/* ── Past sessions ── */}
        {(ag.sessions||[]).length===0
          ? <div style={{color:t.muted,fontSize:14,textAlign:"center",padding:"20px 0"}}>No sessions logged yet — use the form above to log your first.</div>
          : <div>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Session history</div>
              {(ag.sessions||[]).map((s,i)=>{
                const byCol=s.author!=="Alyson";
                const presentNames=s.attendees?.map(id=>members.find(m=>m.id===id)).filter(Boolean).map(m=>dn(m).split(" ")[0]);
                return <div key={i} style={{background:t.surface,border:`1px solid ${ag.color}40`,borderLeft:`3px solid ${byCol?S.purple:ag.color}`,borderRadius:12,padding:"16px 18px",marginBottom:12}}>
                  <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center",flexWrap:"wrap"}}>
                    <Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge>
                    <Badge color={ag.color} bg={ag.colorLight}>{ag.name}</Badge>
                    {presentNames&&<Badge color={t.muted} bg={t.surfaceAlt}>{presentNames.length} attended</Badge>}
                    {s.chargedPerSession&&s.chargeAmount>0&&<Badge color={t.accentText} bg={t.accentLight}>${s.chargeAmount} × {s.attendees?.length||0} charged</Badge>}
                    <span style={{fontSize:12,color:t.accent,opacity:byCol?0.65:1,fontFamily:"'DM Mono',monospace",marginLeft:"auto"}}>{s.author}</span>
                  </div>
                  {presentNames&&<div style={{fontSize:12,color:t.faint,marginBottom:6}}>Present: {presentNames.join(", ")}{s.attendees?.length<members.length?` · Absent: ${members.filter(m=>!s.attendees?.includes(m.id)).map(m=>dn(m).split(" ")[0]).join(", ")}`:"" }</div>}
                  <p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7}}>{s.notes}</p>
                </div>;
              })}
            </div>}
      </div>}
    </div>
  </div>;
}

// ── Alert engine ───────────────────────────────────────────────────────────
const generateAlerts = (interns) => {
  const alerts = [];
  const today = new Date();
  interns.filter(i=>i.status==="active").forEach(intern=>{
    if (!intern.proBono && intern.payments?.some(p=>p.status==="overdue"))
      alerts.push({ id:`pay-${intern.id}`, type:"payment", severity:"high", internId:intern.id, internName:dn(intern), message:`Payment overdue — ${dn(intern)} has an outstanding balance`, action:"payments" });
    if (intern.id===2)
      alerts.push({ id:`doc-${intern.id}`, type:"document", severity:"medium", internId:intern.id, internName:dn(intern), message:`Insurance certificate expiring soon — ${dn(intern)}'s certificate is up in 30 days`, action:"intern-profile" });
    const pct = intern.hoursCompleted/intern.hoursTotal;
    if (pct >= 0.9 && pct < 1)
      alerts.push({ id:`hrs-${intern.id}`, type:"hours", severity:"info", internId:intern.id, internName:dn(intern), message:`${dn(intern)} is at ${Math.round(pct*100)}% of required hours — licensure is close`, action:"intern-profile" });
    if (!intern.documents?.some(d=>d.type==="Evaluation") && intern.id===2)
      alerts.push({ id:`eval-${intern.id}`, type:"evaluation", severity:"medium", internId:intern.id, internName:dn(intern), message:`No evaluation on file for ${dn(intern)} — mid-year evaluation may be due`, action:"intern-profile" });
    // Birthday alert
    if (intern.dob) {
      const dobDate = new Date(intern.dob + "T00:00:00");
      const bm = dobDate.getMonth()+1, bd = dobDate.getDate();
      const isBirthday = bm===today.getMonth()+1 && bd===today.getDate();
      const isUpcoming = (()=>{const next=new Date(today.getFullYear(),bm-1,bd);if(next<today)next.setFullYear(today.getFullYear()+1);const diff=(next-today)/(1000*60*60*24);return diff>0&&diff<=7;})();
      if (isBirthday)
        alerts.push({ id:`bday-${intern.id}`, type:"birthday", severity:"info", internId:intern.id, internName:dn(intern), message:`🎂 Today is ${dn(intern)}'s birthday! Don't forget to wish them well.`, action:"intern-profile" });
      else if (isUpcoming) {
        const next=new Date(today.getFullYear(),bm-1,bd);if(next<today)next.setFullYear(today.getFullYear()+1);
        const days=Math.ceil((next-today)/(1000*60*60*24));
        alerts.push({ id:`bday-${intern.id}`, type:"birthday", severity:"info", internId:intern.id, internName:dn(intern), message:`🎂 ${dn(intern)}'s birthday is in ${days} day${days!==1?"s":""} — a great time to reach out`, action:"intern-profile" });
      }
    }
  });
  alerts.push({ id:"ce-own", type:"ce", severity:"info", internId:null, internName:null, message:"Your LPC-S renewal is due in 4 months — 8 CE hours remaining", action:"ce" });
  return alerts;
};
const alertStyle = (severity, t) => {
  // Severity communicated through border weight, background opacity, and icon — not color alone
  // All styles pull from the active theme for full consistency
  const base = {
    high:   { bg: t ? `${t.accent}18` : "#FFF0F0", border: t ? t.accent : "#A83A3A", borderWidth:3, labelColor: t ? t.accentText : "#A83A3A", label:"Needs attention" },
    medium: { bg: t ? `${t.accent}0D` : "#FFFBF0", border: t ? t.accentMid : "#E8C98A", borderWidth:2, labelColor: t ? t.accent : "#B87D2A", label:"Review needed" },
    info:   { bg: t ? t.surfaceAlt : "#F7F9FC",    border: t ? t.border : "#D8DDE8",   borderWidth:1, labelColor: t ? t.muted : "#6B7590",    label:"Info" },
  };
  return base[severity] || base.info;
};
const alertIcon = (type) => ({ payment:"💳", document:"📄", hours:"🕐", evaluation:"📋", ce:"🎓", birthday:"🎂" }[type]||"●");

// ── CE & License Renewal Tracker ───────────────────────────────────────────
const INITIAL_CE = {
  myLicense:{ type:"LPC-S", number:"TX-LPC-88421", expires:"Jul 31, 2026", renewalHoursRequired:24, renewalHoursCompleted:16 },
  ceLog:[
    { id:"ce1", title:"Trauma-Informed Supervision Practices", provider:"NBCC", hours:3, date:"Jan 15, 2026", category:"Supervision", certificate:true },
    { id:"ce2", title:"Ethics in Clinical Supervision", provider:"ACA",  hours:6, date:"Nov 10, 2025", category:"Ethics",      certificate:true },
    { id:"ce3", title:"Motivational Interviewing Advanced",   provider:"MINT", hours:4, date:"Sep 5, 2025",  category:"Clinical",    certificate:true },
    { id:"ce4", title:"Cultural Humility in Supervision",     provider:"NASW", hours:3, date:"Jun 20, 2025", category:"Diversity",   certificate:false },
  ],
};

function CETrackerPage({ceData,setCeData,T}) {
  const t=T||THEMES.sage;
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({title:"",provider:"",hours:"",date:"",category:"Supervision",certFile:null,certName:""});
  const [viewingCert,setViewingCert]=useState(null);
  const hoursLeft=ceData.myLicense.renewalHoursRequired-ceData.myLicense.renewalHoursCompleted;
  const pct=Math.round((ceData.myLicense.renewalHoursCompleted/ceData.myLicense.renewalHoursRequired)*100);
  const cats=["Supervision","Ethics","Clinical","Diversity","Cultural Competency","Trauma","Other"];

  const handleCertUpload=(e)=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>setForm(p=>({...p,certFile:ev.target.result,certName:file.name,certMime:file.type}));
    reader.readAsDataURL(file);
  };

  const addCE=()=>{
    if(!form.title.trim()||!form.hours) return;
    setCeData(p=>({...p,
      ceLog:[{id:`ce${Date.now()}`,...form,hours:Number(form.hours)},...p.ceLog],
      myLicense:{...p.myLicense,renewalHoursCompleted:p.myLicense.renewalHoursCompleted+Number(form.hours)}
    }));
    setForm({title:"",provider:"",hours:"",date:"",category:"Supervision",certFile:null,certName:""});
    setShowAdd(false);
  };

  const downloadAll=()=>{
    // Download all CE certificates that have files attached
    const withCerts=ceData.ceLog.filter(e=>e.certFile);
    if(withCerts.length===0){alert("No certificates uploaded yet.");return;}
    withCerts.forEach((e,i)=>{
      setTimeout(()=>{
        const a=document.createElement("a");
        a.href=e.certFile;
        a.download=e.certName||`${e.title.replace(/\s+/g,"_")}_certificate`;
        a.click();
      },i*300);
    });
  };

  const downloadCSV=()=>{
    const rows=[["Title","Provider","Hours","Category","Date","Certificate"],
      ...ceData.ceLog.map(e=>[e.title,e.provider||"",e.hours,e.category,e.date||"",e.certName?"Yes":"No"])];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download="CE_log.csv";a.click();
    URL.revokeObjectURL(url);
  };

  const iStyle={width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"};

  return <div>
    {/* Certificate viewer modal */}
    {viewingCert&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}} onClick={()=>setViewingCert(null)}>
      <div style={{background:t.surface,borderRadius:16,width:"80vw",maxWidth:860,maxHeight:"90vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px",borderBottom:`1px solid ${t.border}`}}>
          <div style={{fontSize:14,color:t.text,fontWeight:500}}>{viewingCert.certName}</div>
          <div style={{display:"flex",gap:8}}>
            <a href={viewingCert.certFile} download={viewingCert.certName}
              style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.text,fontFamily:"'DM Mono',monospace",textDecoration:"none"}}>⬇ Download</a>
            <button onClick={()=>setViewingCert(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.muted}}>✕</button>
          </div>
        </div>
        <div style={{flex:1,overflow:"auto",padding:16,display:"flex",justifyContent:"center"}}>
          {viewingCert.certMime==="application/pdf"
            ? <iframe src={viewingCert.certFile} title={viewingCert.certName} style={{width:"100%",height:"70vh",border:"none"}}/>
            : viewingCert.certMime?.startsWith("image/")
              ? <img src={viewingCert.certFile} alt={viewingCert.certName} style={{maxWidth:"100%"}}/>
              : <div style={{color:t.muted,padding:40,textAlign:"center"}}>Preview not available — use Download button above.</div>}
        </div>
      </div>
    </div>}

    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>CE & License Renewal</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>Track your continuing education and attach certificates for renewal</p>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn T={t} variant="secondary" small onClick={downloadCSV}>⬇ Log (.csv)</Btn>
        <Btn T={t} variant="secondary" small onClick={downloadAll}>⬇ All certificates</Btn>
        <Btn T={t} small onClick={()=>setShowAdd(true)}>+ Log CE hours</Btn>
      </div>
    </div>

    {/* License progress card */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:18,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:6}}>My license</div>
          <div style={{fontSize:22,color:t.text,marginBottom:4}}>{ceData.myLicense.type} <span style={{fontSize:14,color:t.muted,fontFamily:"'DM Mono',monospace"}}>#{ceData.myLicense.number}</span></div>
          <div style={{fontSize:13,color:hoursLeft<=8?t.accent:t.muted}}>Expires {ceData.myLicense.expires} · {hoursLeft} CE hours remaining</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:28,color:pct>=75?t.accent:S.amber,lineHeight:1,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{pct}%</div>
          <div style={{fontSize:12,color:t.muted}}>of renewal completed</div>
        </div>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:13,color:t.text}}>CE hours toward renewal</span>
        <span style={{fontSize:13,fontFamily:"'DM Mono',monospace",color:t.accent}}>{ceData.myLicense.renewalHoursCompleted} / {ceData.myLicense.renewalHoursRequired}</span>
      </div>
      <div style={{height:8,background:t.borderLight,borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,borderRadius:999}}/>
      </div>
      {hoursLeft<=8&&<div style={{fontSize:12,color:t.accentText,marginTop:8}}>⚠ Renewal deadline approaching — {hoursLeft} hours still needed before {ceData.myLicense.expires}</div>}
    </div>

    {/* Add form */}
    {showAdd&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"20px 22px",marginBottom:16}}>
      <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:14}}>Log CE hours</div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Course / training title *</div>
          <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="e.g. Ethics in Clinical Supervision" style={iStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Provider</div>
          <input value={form.provider} onChange={e=>setForm(p=>({...p,provider:e.target.value}))} placeholder="NBCC, ACA..." style={iStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Hours *</div>
          <input type="number" value={form.hours} onChange={e=>setForm(p=>({...p,hours:e.target.value}))} placeholder="3" style={iStyle}/>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Date</div>
          <input type="date" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))} style={iStyle}/>
        </div>
        <div>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Category</div>
          <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{...iStyle,cursor:"pointer"}}>
            {cats.map(c=><option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      {/* Certificate upload */}
      <div style={{marginBottom:14}}>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Certificate (optional)</div>
        {form.certFile
          ? <div style={{display:"flex",alignItems:"center",gap:10,background:t.surfaceAlt,borderRadius:8,padding:"8px 14px"}}>
              <span style={{fontSize:13,color:t.accentText}}>📄 {form.certName}</span>
              <button onClick={()=>setForm(p=>({...p,certFile:null,certName:""}))}
                style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:S.red,marginLeft:"auto",fontFamily:"'DM Mono',monospace"}}>Remove</button>
            </div>
          : <label style={{display:"flex",alignItems:"center",gap:10,background:t.surfaceAlt,border:`1px dashed ${t.border}`,borderRadius:8,padding:"10px 16px",cursor:"pointer"}}>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleCertUpload} style={{display:"none"}}/>
              <span style={{fontSize:13,color:t.muted}}>📎 Upload certificate (PDF or image)</span>
            </label>}
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn T={t} small onClick={addCE}>Save CE entry</Btn>
        <Btn T={t} variant="secondary" small onClick={()=>setShowAdd(false)}>Cancel</Btn>
      </div>
    </div>}

    {/* CE log table */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr .7fr 1fr .8fr .6fr",background:t.surfaceAlt,padding:"10px 18px",gap:8}}>
        {["Course","Provider","Hours","Category","Date","Cert"].map(h=>(
          <div key={h} style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{h}</div>
        ))}
      </div>
      {ceData.ceLog.length===0&&<div style={{padding:"32px",textAlign:"center",color:t.muted,fontSize:14}}>No CE entries yet — click "+ Log CE hours" to add one.</div>}
      {ceData.ceLog.map(e=>(
        <div key={e.id} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr .7fr 1fr .8fr .6fr",padding:"12px 18px",gap:8,borderTop:`1px solid ${t.borderLight}`,alignItems:"center"}}>
          <div style={{fontSize:13,color:t.text,fontWeight:500}}>{e.title}</div>
          <div style={{fontSize:12,color:t.muted}}>{e.provider}</div>
          <div style={{fontSize:13,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{e.hours} hrs</div>
          <div><Badge color={t.muted} bg={t.surfaceAlt}>{e.category}</Badge></div>
          <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{e.date||"—"}</div>
          <div>
            {e.certFile
              ? <button onClick={()=>setViewingCert(e)}
                  style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace"}}>
                  📄 View
                </button>
              : <span style={{fontSize:12,color:t.faint}}>—</span>}
          </div>
        </div>
      ))}
    </div>
  </div>;
}

// ── Evaluation tab ─────────────────────────────────────────────────────────
const EVAL_QUESTIONS=[
  {id:"clinical",      label:"Clinical skills & case conceptualization"},
  {id:"ethics",        label:"Ethical decision-making & professional conduct"},
  {id:"documentation", label:"Documentation quality & timeliness"},
  {id:"communication", label:"Communication & supervisory relationship"},
  {id:"selfawareness", label:"Self-awareness & use of supervision"},
  {id:"diversity",     label:"Cultural competency & diversity awareness"},
];

function EvaluationTab({intern,onUpdateIntern,T}) {
  const t=T||THEMES.sage;
  const [evals,setEvals]=useState(intern.evaluations||[]);
  const [showNew,setShowNew]=useState(false);
  const [evalType,setEvalType]=useState("mid-year");
  const [ratings,setRatings]=useState(Object.fromEntries(EVAL_QUESTIONS.map(q=>[q.id,3])));
  const [strengths,setStrengths]=useState("");
  const [growth,setGrowth]=useState("");
  const [goals,setGoals]=useState("");
  const [generating,setGenerating]=useState(false);
  const [generatedSummary,setGeneratedSummary]=useState("");

  const generateSummary=async()=>{
    setGenerating(true);
    const ratingText=EVAL_QUESTIONS.map(q=>`- ${q.label}: ${ratings[q.id]}/5`).join("\n");
    const prompt=`You are a licensed clinical supervisor writing a formal evaluation of a supervisee. Write a professional, balanced evaluation summary based on these ratings and notes.\n\nSupervisee: ${intern.name}\nEvaluation type: ${evalType}\nCredential goal: ${intern.licenseGoal}\n\nRatings (1-5):\n${ratingText}\n\nStrengths: ${strengths||"Not specified"}\nGrowth areas: ${growth||"Not specified"}\nGoals: ${goals||"Not specified"}\n\nWrite a 2-3 paragraph professional evaluation in third person. Reference the supervisee by last name. Be specific, balanced, and clinically appropriate.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      setGeneratedSummary(data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"");
    }catch(e){setGeneratedSummary("Unable to generate. Please write manually.");}
    setGenerating(false);
  };

  const saveEval=()=>{
    const newEval={id:`ev${Date.now()}`,type:evalType,date:"Mar 21, 2026",ratings:{...ratings},strengths,growth,goals,summary:generatedSummary,supervisorSigned:true,internSigned:false};
    const updated={...intern,evaluations:[newEval,...evals]};
    setEvals(updated.evaluations);onUpdateIntern(updated);
    setShowNew(false);setGeneratedSummary("");setStrengths("");setGrowth("");setGoals("");
    setRatings(Object.fromEntries(EVAL_QUESTIONS.map(q=>[q.id,3])));
  };

  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
      <div style={{fontSize:14,color:t.muted}}>{evals.length} evaluation{evals.length!==1?"s":""} on file</div>
      <Btn T={t} small onClick={()=>setShowNew(true)}>✦ New evaluation</Btn>
    </div>
    {evals.length===0&&!showNew&&<div style={{background:t.surfaceAlt,borderRadius:12,padding:24,textAlign:"center",color:t.muted,fontSize:14}}>No evaluations yet — create a mid-year or end-of-year evaluation above.</div>}
    {evals.map((ev,i)=><div key={ev.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge color={t.accentText} bg={t.accentLight}>{ev.type}</Badge><span style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{ev.date}</span></div>
        <div style={{display:"flex",gap:6}}>
          <Badge color={S.green} bg={S.greenLight}>Supervisor signed</Badge>
          {ev.internSigned?<Badge color={S.green} bg={S.greenLight}>Intern signed</Badge>:<Badge color={S.amber} bg={S.amberLight}>Awaiting intern signature</Badge>}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:ev.summary?12:0}}>
        {EVAL_QUESTIONS.map(q=><div key={q.id} style={{background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
          <div style={{fontSize:11,color:t.muted,marginBottom:3}}>{q.label}</div>
          <div style={{fontSize:16,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{ev.ratings[q.id]}<span style={{fontSize:11,color:t.muted}}>/5</span></div>
        </div>)}
      </div>
      {ev.summary&&<p style={{fontSize:14,color:t.text,lineHeight:1.7,margin:0}}>{ev.summary}</p>}
    </div>)}
    {showNew&&<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:16}}>New evaluation — {dn(intern)}</div>
      <div style={{display:"flex",gap:8,marginBottom:18}}>{["mid-year","end-of-year","probationary","final"].map(type=><button key={type} onClick={()=>setEvalType(type)} style={{background:evalType===type?t.accentLight:"none",color:evalType===type?t.accentText:t.muted,border:`1px solid ${evalType===type?t.accentMid:t.border}`,borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{type}</button>)}</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
        {EVAL_QUESTIONS.map(q=><div key={q.id}>
          <div style={{fontSize:13,color:t.text,marginBottom:6}}>{q.label}</div>
          <div style={{display:"flex",gap:6}}>{[1,2,3,4,5].map(n=><button key={n} onClick={()=>setRatings(p=>({...p,[q.id]:n}))} style={{width:36,height:36,borderRadius:8,border:`1px solid ${ratings[q.id]===n?t.accent:t.border}`,background:ratings[q.id]===n?t.accentLight:"none",color:ratings[q.id]===n?t.accentText:t.muted,cursor:"pointer",fontSize:14,fontFamily:"'DM Mono',monospace"}}>{n}</button>)}</div>
        </div>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
        {[["Identified strengths",strengths,setStrengths],["Areas for growth",growth,setGrowth],["Goals for next period",goals,setGoals]].map(([label,val,setter])=>(
          <div key={label}><div style={{fontSize:12,color:t.muted,marginBottom:6,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</div>
            <textarea value={val} onChange={e=>setter(e.target.value)} placeholder="Brief notes..." style={{width:"100%",height:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"none",boxSizing:"border-box",outline:"none"}}/></div>
        ))}
      </div>
      {generatedSummary&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:"16px 18px",fontSize:14,color:t.text,lineHeight:1.7,marginBottom:14,whiteSpace:"pre-wrap"}}>{generatedSummary}</div>}
      <div style={{display:"flex",gap:8}}>
        <Btn T={t} variant="secondary" onClick={generateSummary}>{generating?"Generating…":"✦ Generate AI summary"}</Btn>
        {generatedSummary&&<Btn T={t} onClick={saveEval}>Save evaluation</Btn>}
        <Btn T={t} variant="secondary" onClick={()=>{setShowNew(false);setGeneratedSummary("");}}>Cancel</Btn>
      </div>
    </div>}
  </div>;
}

// ── Onboarding modal ───────────────────────────────────────────────────────
// ── Add Intern manually ────────────────────────────────────────────────────
function AddInternModal({onSave, onClose, onSendLink, groups, lists, T}) {
  const t = T||THEMES.sage;
  const [form, setForm] = useState({
    name:"", preferredName:"", pronouns:"", gender:"", race:"", ethnicity:"",
    discipline:"counseling", credential:"LPC-Intern", credentialBody:"CACREP",
    licenseGoal:"LPC", startDate: new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}),
    supervisorRole:"primary", proBono:false, groupIds:[], listIds:[], dob:"",
    university:"", paymentAmount:"", paymentFrequency:"monthly",
  });
  const [step, setStep] = useState(1); // 1=personal, 2=credential, 3=settings
  const [error, setError] = useState("");

  const set = (key, val) => setForm(p=>({...p,[key]:val}));

  const DISCIPLINE_OPTS = [
    {id:"counseling",     label:"Counseling (LPC/LPCC)"},
    {id:"social_work",    label:"Social Work (LCSW)"},
    {id:"mft",            label:"Marriage & Family Therapy"},
    {id:"substance_use",  label:"Substance Use (CADC/LADC)"},
    {id:"psychology",     label:"Psychology"},
    {id:"sos",            label:"Supervision of Supervision"},
    {id:"student",        label:"Student / Practicum Intern"},
  ];
  const CRED_BY_DISC = {
    counseling:["LPC-Intern","LPC-Associate","LPC","LPCC","LCMHC","NCC"],
    social_work:["LBSW","LMSW","LCSW","LCSW-C"],
    mft:["MFT-Intern","AMFT","LMFT-A","LMFT"],
    substance_use:["CADC-I","CADC-II","LADC","LCDC","CSAC","CASAC","RADT"],
    psychology:["Doctoral Intern","Postdoctoral Resident","Psychologist","ABPP"],
    sos:["LPC","LCSW","LMFT"],
    student:["Practicum Student"],
  };
  const GOAL_BY_DISC = {
    counseling:["LPC","LPCC","LCMHC","LPC-S"],
    social_work:["LCSW","LCSW-C","LICSW"],
    mft:["LMFT","AAMFT Approved Supervisor"],
    substance_use:["CADC-II","LADC","LCDC","CASAC"],
    psychology:["Licensed Psychologist","ABPP"],
    sos:["LPC-S","LCSW-S","LMFT-S","AAMFT Approved Supervisor"],
    student:["LPC","LCSW","LMFT"],
  };
  const BODY_BY_DISC = {
    counseling:["CACREP","State Board","NBCC"],
    social_work:["NASW","State Board","CSWE"],
    mft:["COAMFTE","AAMFT","State Board"],
    substance_use:["NAADAC","IC&RC","State Board"],
    psychology:["APA","State Board"],
    sos:["State Board","ACES"],
    student:["University"], // always locked to University for students
  };

  const creds = CRED_BY_DISC[form.discipline]||[];
  const goals = GOAL_BY_DISC[form.discipline]||[];
  const bodies = BODY_BY_DISC[form.discipline]||[];

  const save = () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (form.discipline==="student"&&!form.university?.trim()) { setStep(2); setError("University name is required for practicum students."); return; }
    const initials = form.name.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const id = Date.now();
    const newIntern = {
      id, name:form.name.trim(), preferredName:form.preferredName.trim(),
      initials, pronouns:form.pronouns.trim(),
      gender:form.gender||"", race:form.race||"", ethnicity:form.ethnicity||"",
      discipline:form.discipline, internType:form.discipline,
      credential:form.credential, credentialBody:form.credentialBody,
      university:form.discipline==="student"?form.university:"",
      licenseGoal:form.licenseGoal, startDate:form.startDate,
      supervisorRole:form.supervisorRole,
      status:"active", proBono:form.proBono,
      groupIds:form.groupIds, listIds:form.listIds,
      dob:form.dob, photo:null, flags:[],
      hoursCompleted:0, hoursTotal:form.discipline==="substance_use"?2000:form.discipline==="student"?300:3000,
      individualHours:0, groupHours:0,
      hourLog:[], internHourLog:[], customHourCategories:[],
      payments:form.proBono?[]:[{month:TODAY(),amount:form.paymentAmount,status:"overdue"}],
      paymentStatus:form.proBono?"current":"overdue",
      billingSchedule:form.paymentFrequency||"monthly", billingRate:form.paymentAmount,
      sessions:[], cases:[], documents:[], evaluations:[],
      sharedWith:[],
    };
    onSave(newIntern);
    onClose();
  };

  const inputStyle = {border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",width:"100%",boxSizing:"border-box"};
  const labelStyle = {fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6,display:"block"};

  const STEPS = ["Personal info","Credentials","Settings"];

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,padding:"28px 32px",width:560,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"inherit",fontSize:22,color:t.text,marginBottom:3}}>Add a new supervisee</div>
          <div style={{fontSize:13,color:t.muted}}>Step {step} of 3 — {STEPS[step-1]}</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.faint,padding:4}}>✕</button>
      </div>

      {/* Step dots */}
      <div style={{display:"flex",gap:6,marginBottom:24}}>
        {STEPS.map((s,i)=><div key={i} style={{flex:1,height:3,borderRadius:999,background:i<step?t.accent:i===step-1?t.accentMid:t.borderLight,transition:"background 0.3s"}}/>)}
      </div>

      {error&&<div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:8,padding:"8px 14px",fontSize:13,color:t.accentText,marginBottom:16}}>⚠ {error}</div>}

      {/* Step 1 — Personal */}
      {step===1&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={labelStyle}>Full legal name *</label>
          <input value={form.name} onChange={e=>{set("name",e.target.value);setError("");}} placeholder="e.g. Marissa Holloway" style={inputStyle}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={labelStyle}>Preferred / nickname</label>
            <input value={form.preferredName} onChange={e=>set("preferredName",e.target.value)} placeholder="e.g. Riss (optional)" style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Pronouns</label>
            <input value={form.pronouns} onChange={e=>set("pronouns",e.target.value)} placeholder="e.g. she/her" style={inputStyle}/>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={labelStyle}>Date of birth</label>
            <input type="date" value={form.dob} onChange={e=>set("dob",e.target.value)} style={inputStyle}/>
          </div>
          <div>
            <label style={labelStyle}>Start date</label>
            <input value={form.startDate} onChange={e=>set("startDate",e.target.value)} placeholder="e.g. Mar 2026" style={inputStyle}/>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Gender identity</label>
          <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
            {["","Man","Woman","Nonbinary","Genderqueer","Transgender man","Transgender woman","Gender fluid","Agender","Two-spirit","Prefer not to say","Other"].map(g=><option key={g} value={g}>{g||"— Select —"}</option>)}
          </select>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div>
            <label style={labelStyle}>Race</label>
            <select value={form.race} onChange={e=>set("race",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
              {["","American Indian or Alaska Native","Asian","Black or African American","Native Hawaiian or Pacific Islander","White","Multiracial","Prefer not to say","Other"].map(r=><option key={r} value={r}>{r||"— Select —"}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Ethnicity</label>
            <select value={form.ethnicity} onChange={e=>set("ethnicity",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
              {["","Hispanic or Latino","Not Hispanic or Latino","Prefer not to say"].map(e=><option key={e} value={e}>{e||"— Select —"}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Supervisor role</label>
          <div style={{display:"flex",gap:8}}>
            {["primary","secondary"].map(r=>(
              <button key={r} onClick={()=>set("supervisorRole",r)}
                style={{flex:1,background:form.supervisorRole===r?t.accentLight:t.surfaceAlt,color:form.supervisorRole===r?t.accentText:t.muted,border:`1px solid ${form.supervisorRole===r?t.accentMid:t.border}`,borderRadius:8,padding:"8px 0",cursor:"pointer",fontSize:13,textTransform:"capitalize"}}>
                {r} supervisor
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* Step 2 — Credentials */}
      {step===2&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        <div>
          <label style={labelStyle}>Discipline</label>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {DISCIPLINE_OPTS.map(d=>(
              <button key={d.id} onClick={()=>{
                set("discipline",d.id);
                set("credential",CRED_BY_DISC[d.id]?.[0]||"");
                set("licenseGoal",GOAL_BY_DISC[d.id]?.[0]||"");
                set("credentialBody",BODY_BY_DISC[d.id]?.[0]||"");
                if(d.id!=="student") set("university","");
              }}
                style={{background:form.discipline===d.id?t.accentLight:t.surfaceAlt,color:form.discipline===d.id?t.accentText:t.text,border:`1px solid ${form.discipline===d.id?t.accentMid:t.border}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",textAlign:"left",fontSize:13,transition:"all 0.1s"}}>
                {form.discipline===d.id?"✓ ":""}{d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Student-specific: locked credential + university */}
        {form.discipline==="student"
          ? <div style={{background:t.surfaceAlt,borderRadius:10,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
              <div style={{fontSize:12,color:t.accentText,fontFamily:"'DM Mono',monospace",marginBottom:2}}>ℹ Practicum students always use "Practicum Student" and "University" — these are locked.</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <label style={labelStyle}>Current credential</label>
                  <div style={{...inputStyle,background:t.surfaceAlt,color:t.muted,cursor:"not-allowed"}}>Practicum Student</div>
                </div>
                <div>
                  <label style={labelStyle}>Credentialing body</label>
                  <div style={{...inputStyle,background:t.surfaceAlt,color:t.muted,cursor:"not-allowed"}}>University</div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>University name *</label>
                <input value={form.university||""} onChange={e=>set("university",e.target.value)}
                  placeholder="e.g. University of Nevada, Reno" autoFocus
                  style={{...inputStyle,borderColor:!form.university?.trim()?t.accentMid:t.border}}/>
                {!form.university?.trim()&&<div style={{fontSize:11,color:t.accentText,marginTop:3,fontFamily:"'DM Mono',monospace"}}>Required</div>}
              </div>
              <div>
                <label style={labelStyle}>Licensure goal</label>
                <select value={form.licenseGoal} onChange={e=>set("licenseGoal",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                  {goals.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
            </div>
          : <>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <label style={labelStyle}>Current credential</label>
                  <select value={form.credential} onChange={e=>set("credential",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                    {creds.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Credentialing body</label>
                  <select value={form.credentialBody} onChange={e=>set("credentialBody",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                    {bodies.map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Licensure goal</label>
                <select value={form.licenseGoal} onChange={e=>set("licenseGoal",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                  {goals.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
            </>}
      </div>}

      {/* Step 3 — Settings */}
      {step===3&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
        {/* Pro bono toggle */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surfaceAlt,borderRadius:10,padding:"12px 16px"}}>
          <div>
            <div style={{fontSize:14,color:t.text,fontWeight:500}}>Pro bono</div>
            <div style={{fontSize:12,color:t.muted,marginTop:2}}>No payment tracking for this supervisee</div>
          </div>
          <button onClick={()=>set("proBono",!form.proBono)}
            style={{background:form.proBono?t.accent:t.border,border:"none",borderRadius:20,width:44,height:24,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
            <span style={{position:"absolute",top:3,left:form.proBono?22:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
          </button>
        </div>

        {/* Payment settings — only if not pro bono */}
        {!form.proBono&&<div style={{border:`1px solid ${t.border}`,borderRadius:10,padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{fontSize:13,color:t.text,fontWeight:500}}>Billing</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div>
              <label style={labelStyle}>Fee amount ($)</label>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{color:t.muted,fontSize:14}}>$</span>
                <input type="number" min="0" value={form.paymentAmount} onChange={e=>set("paymentAmount",Number(e.target.value))}
                  style={{...inputStyle,width:"100%"}}/>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Billing frequency</label>
              <select value={form.paymentFrequency} onChange={e=>set("paymentFrequency",e.target.value)} style={{...inputStyle,cursor:"pointer"}}>
                {["weekly","biweekly","monthly","per session","per semester","custom"].map(f=><option key={f} value={f}>{f.charAt(0).toUpperCase()+f.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div style={{fontSize:12,color:t.muted}}>
            Billing summary: <strong style={{color:t.text}}>${form.paymentAmount} {form.paymentFrequency}</strong>. You can update this anytime from their Payments tab.
          </div>
        </div>}

        {/* Groups */}
        {groups.length>0&&<div>
          <label style={labelStyle}>Assign to group(s)</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {groups.map(g=>{
              const on=form.groupIds.includes(g.id);
              return <button key={g.id} onClick={()=>set("groupIds",on?form.groupIds.filter(id=>id!==g.id):[...form.groupIds,g.id])}
                style={{background:on?g.colorLight:t.surfaceAlt,color:on?g.color:t.muted,border:`1px solid ${on?g.color:t.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:5}}>
                {on?"✓ ":""}<span style={{width:6,height:6,borderRadius:"50%",background:g.color,display:"inline-block"}}/>{g.name}
              </button>;
            })}
          </div>
        </div>}

        {/* Summary — clear, no mystery white box */}
        <div style={{background:t.surfaceAlt,borderRadius:10,padding:"14px 16px",border:`1px solid ${t.border}`}}>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Ready to add</div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            {[
              ["Name",        `${form.name||"—"}${form.preferredName?` (${form.preferredName})`:""}`],
              ["Pronouns",    form.pronouns||"Not specified"],
              ["DOB",         form.dob ? new Date(form.dob+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "Not specified"],
              ["Credential",  `${form.credential} → ${form.licenseGoal}`],
              ["Body",        form.discipline==="student"?`University${form.university?` — ${form.university}`:""}`:form.credentialBody],
              ["Role",        `${form.supervisorRole.charAt(0).toUpperCase()+form.supervisorRole.slice(1)} supervisor`],
              ["Billing",     form.proBono?"Pro bono":`$${form.paymentAmount} / ${form.paymentFrequency}`],
            ].map(([label,val])=>(
              <div key={label} style={{display:"flex",gap:8,fontSize:13}}>
                <span style={{color:t.muted,minWidth:80,fontFamily:"'DM Mono',monospace",fontSize:11,paddingTop:2}}>{label}</span>
                <span style={{color:t.text}}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* Footer */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:24,paddingTop:16,borderTop:`1px solid ${t.borderLight}`}}>
        <div style={{display:"flex",gap:8}}>
          {step>1&&<Btn T={t} variant="secondary" onClick={()=>setStep(s=>s-1)}>← Back</Btn>}
          {step===1&&<button onClick={onSendLink} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:t.faint,padding:0,fontFamily:"'DM Mono',monospace"}}>Send link instead →</button>}
        </div>
        {step<3
          ? <Btn T={t} onClick={()=>{if(step===1&&!form.name.trim()){setError("Name is required.");return;}setError("");setStep(s=>s+1);}}>Next →</Btn>
          : <Btn T={t} onClick={save}>✓ Add supervisee</Btn>}
      </div>
    </div>
  </div>;
}

function OnboardingModal({onClose,supervisorName,T}) {
  const t=T||THEMES.sage;
  const [step,setStep]=useState(0); // 0=overview, 1=customize, 2=link
  const [copied,setCopied]=useState(false);
  const [includePayment,setIncludePayment]=useState(true);
  const [payFrequency,setPayFrequency]=useState("monthly");
  const [showLinkPreview,setShowLinkPreview]=useState(false);
  const [includeAgreement,setIncludeAgreement]=useState(true);
  const [includeDocs,setIncludeDocs]=useState(true);
  const [customMessage,setCustomMessage]=useState("");
  const [expiryDays,setExpiryDays]=useState("30");

  const slugName=(supervisorName||"supervisor").toLowerCase().replace(/[^a-z0-9]/g,"-").replace(/-+/g,"-");
  const token=React.useMemo(()=>"st_"+Math.random().toString(36).slice(2,10),[]);
  const link=`https://app.suptrack.io/join/${slugName}?token=${token}`;

  const copy=()=>{
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(()=>setCopied(false),2500);
  };

  const STEPS=[
    {id:"info",      label:"Personal info",  desc:"Name, pronouns, preferred name, birthday, contact info"},
    {id:"creds",     label:"Credentials",    desc:"License type, number, body, and licensure goal"},
    {id:"docs",      label:"Documents",      desc:"Upload license, insurance, and required forms",       toggle:includeDocs,    setToggle:setIncludeDocs},
    {id:"agreement", label:"Agreement",      desc:"Review and e-sign your supervision agreement",        toggle:includeAgreement,setToggle:setIncludeAgreement},
    {id:"payment",   label:"Payment setup",  desc:"Connect payment method or mark as pro bono",          toggle:includePayment,  setToggle:setIncludePayment},
  ];

  const iStyle={width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"};

  return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={onClose}>
    <div style={{background:t.surface,borderRadius:18,width:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>

      {/* Header */}
      <div style={{padding:"22px 28px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:3}}>Intern onboarding link</div>
          <div style={{fontSize:13,color:t.muted}}>Generate a link to send a new intern — they complete everything themselves</div>
        </div>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:t.faint,padding:4,marginLeft:12,flexShrink:0}}>✕</button>
      </div>

      {/* Step pills */}
      <div style={{display:"flex",gap:6,padding:"16px 28px 0"}}>
        {["Overview","Customize","Get link"].map((s,i)=>(
          <div key={s} style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>setStep(i)}
              style={{background:step===i?t.accent:step>i?t.accentLight:"none",color:step===i?"#fff":step>i?t.accentText:t.faint,border:`1px solid ${step===i?t.accent:step>i?t.accentMid:t.border}`,borderRadius:20,padding:"4px 14px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",transition:"all 0.15s"}}>
              {step>i?"✓ ":""}{s}
            </button>
            {i<2&&<span style={{color:t.faint,fontSize:12}}>›</span>}
          </div>
        ))}
      </div>

      <div style={{padding:"20px 28px 24px"}}>

        {/* Step 0: Overview */}
        {step===0&&<div>
          <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:14}}>What your intern will complete:</div>
          <div style={{display:"flex",flexDirection:"column",gap:0,border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",marginBottom:20}}>
            {STEPS.map((s,i)=>(
              <div key={s.id} style={{display:"flex",alignItems:"center",gap:12,padding:"13px 16px",borderTop:i>0?`1px solid ${t.borderLight}`:"none",background:s.toggle===false?t.surfaceAlt:"transparent",opacity:s.toggle===false?0.5:1}}>
                <div style={{width:26,height:26,borderRadius:"50%",background:s.toggle===false?t.surfaceAlt:t.accentLight,border:`1px solid ${s.toggle===false?t.border:t.accentMid}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:t.accentText,fontWeight:600,flexShrink:0}}>
                  {s.toggle===false?"—":i+1}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,color:t.text,fontWeight:500}}>{s.label}</div>
                  <div style={{fontSize:12,color:t.muted,marginTop:1}}>{s.desc}</div>
                </div>
                {s.setToggle&&<button onClick={()=>s.setToggle(!s.toggle)}
                  style={{background:s.toggle?t.accentLight:t.surfaceAlt,color:s.toggle?t.accentText:t.faint,border:`1px solid ${s.toggle?t.accentMid:t.border}`,borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.15s"}}>
                  {s.toggle?"On":"Off"}
                </button>}
              </div>
            ))}
          </div>
          <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"12px 16px",fontSize:13,color:t.accentText,marginBottom:20,lineHeight:1.6}}>
            Once they complete onboarding, they appear in your supervisees list automatically — no manual entry needed.
          </div>
          <div style={{display:"flex",justifyContent:"flex-end"}}>
            <Btn T={t} onClick={()=>setStep(1)}>Customize link →</Btn>
          </div>
        </div>}

        {/* Step 1: Customize */}
        {step===1&&<div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Personal message (optional)</div>
              <textarea value={customMessage} onChange={e=>setCustomMessage(e.target.value)}
                placeholder={`Hi! I'm looking forward to working with you. Please complete your onboarding at the link below — it only takes a few minutes. Reach out if you have any questions.\n\n— ${supervisorName||"Your Supervisor"}`}
                rows={4} style={{...iStyle,resize:"vertical",lineHeight:1.6}}/>
              <div style={{fontSize:11,color:t.faint,marginTop:4}}>Appears at the top of the intern's onboarding page.</div>
            </div>
            <div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Link expires after</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["7","14","30","60","Never"].map(d=>(
                  <button key={d} onClick={()=>setExpiryDays(d)}
                    style={{background:expiryDays===d?t.accentLight:"none",color:expiryDays===d?t.accentText:t.muted,border:`1px solid ${expiryDays===d?t.accentMid:t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                    {d==="Never"?"Never":d+" days"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Sections to include</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {STEPS.filter(s=>s.setToggle).map(s=>(
                  <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.surfaceAlt,borderRadius:8,padding:"10px 14px"}}>
                    <div>
                      <div style={{fontSize:13,color:t.text,fontWeight:500}}>{s.label}</div>
                      <div style={{fontSize:11,color:t.muted}}>{s.desc}</div>
                    </div>
                    <button onClick={()=>s.setToggle(!s.toggle)}
                      style={{background:s.toggle?t.accent:t.surfaceAlt,border:`1px solid ${s.toggle?t.accent:t.border}`,borderRadius:20,width:40,height:22,cursor:"pointer",position:"relative",transition:"all 0.2s",flexShrink:0}}>
                      <span style={{position:"absolute",top:2,left:s.toggle?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.2s"}}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Payment frequency — only shown if payment is enabled */}
            {includePayment&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Billing frequency to show intern</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["weekly","biweekly","monthly","per session","per semester"].map(f=>(
                  <button key={f} onClick={()=>setPayFrequency(f)}
                    style={{background:payFrequency===f?t.accentLight:"none",color:payFrequency===f?t.accentText:t.muted,border:`1px solid ${payFrequency===f?t.accentMid:t.border}`,borderRadius:7,padding:"4px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{fontSize:11,color:t.faint,marginTop:6}}>Interns will see this frequency when setting up payment. You can change it later from their profile.</div>
            </div>}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <Btn T={t} variant="secondary" onClick={()=>setStep(0)}>← Back</Btn>
            <Btn T={t} onClick={()=>setStep(2)}>Generate link →</Btn>
          </div>
        </div>}

        {/* Step 2: Link */}
        {step===2&&<div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:28,marginBottom:8}}>🔗</div>
            <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:4}}>Your onboarding link is ready</div>
            <div style={{fontSize:13,color:t.muted}}>Send via email or text. Expires {expiryDays==="Never"?"never":expiryDays+" days from now"}.</div>
          </div>

          {/* Link box */}
          <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
            <div style={{flex:1,fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{link}</div>
            <button onClick={()=>{
                copy();
                // Save pending onboard to localStorage so the link "works" in the prototype
                try{localStorage.setItem("suptrack_pending_onboard",JSON.stringify({token,supervisorName,customMessage,expiryDays,steps:STEPS.filter(s=>s.toggle!==false).map(s=>s.id),created:Date.now()}));}catch{}
              }}
              style={{background:copied?t.accent:t.surface,color:copied?"#fff":t.text,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 16px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace",flexShrink:0,transition:"all 0.15s",whiteSpace:"nowrap"}}>
              {copied?"✓ Copied!":"Copy link"}
            </button>
          </div>
          <div style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"8px 14px",marginBottom:12,fontSize:12,color:t.accentText}}>
            ✓ Link saved — click "Open onboarding form" below to demo the intern experience, or send the copied link to your intern.
          </div>

          {/* Intern-facing page preview */}
          <div style={{marginBottom:14}}>
            <button onClick={()=>setShowLinkPreview(p=>!p)}
              style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",width:"100%",textAlign:"center"}}>
              {showLinkPreview?"▾ Hide page preview":"▸ Preview what your intern will see"}
            </button>
            {showLinkPreview&&<div style={{border:`1px solid ${t.border}`,borderRadius:12,overflow:"hidden",marginTop:10}}>
              {/* Simulated intern onboarding page */}
              <div style={{background:"#F8F8FC",padding:"20px 22px"}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
                  <div style={{fontSize:18,fontWeight:700,color:"#3D5A7A",fontFamily:"inherit"}}>SupTrack</div>
                  <div style={{fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace",background:"#EEF2F8",borderRadius:4,padding:"2px 8px"}}>Onboarding</div>
                </div>
                <div style={{background:"#fff",borderRadius:10,padding:"16px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                  <div style={{fontSize:15,fontWeight:500,color:"#1A1A2E",marginBottom:6}}>Welcome to SupTrack</div>
                  <div style={{fontSize:12,color:"#666",marginBottom:12,lineHeight:1.6}}>
                    {customMessage || `Hi!\n\nI'm looking forward to working with you. Please complete your onboarding below — it only takes a few minutes.\n\n— ${supervisorName||"Your Supervisor"}`}
                  </div>
                  <div style={{fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace",marginBottom:10}}>YOUR SUPERVISOR</div>
                  <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px",background:"#F3F4F6",borderRadius:8,marginBottom:14}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:"#3D5A7A",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:700}}>
                      {(supervisorName||"A").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{fontSize:13,color:"#1A1A2E",fontWeight:500}}>{supervisorName||"Your Supervisor"}</div>
                      <div style={{fontSize:11,color:"#888"}}>LPC-S · SupTrack</div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:"#888",fontFamily:"'DM Mono',monospace",marginBottom:8}}>STEPS TO COMPLETE</div>
                  {STEPS.filter(s=>s.toggle!==false).map((s,i)=>(
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderTop:i>0?"1px solid #F0F0F0":"none"}}>
                      <div style={{width:22,height:22,borderRadius:"50%",background:"#EEF2F8",border:"1px solid #CBD5E1",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#3D5A7A",fontWeight:600,flexShrink:0}}>{i+1}</div>
                      <div style={{fontSize:12,color:"#374151",fontWeight:500}}>{s.label}</div>
                    </div>
                  ))}
                  <button style={{width:"100%",background:"#3D5A7A",color:"#fff",border:"none",borderRadius:8,padding:"10px",marginTop:14,cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                    Get started →
                  </button>
                </div>
                <div style={{fontSize:10,color:"#aaa",textAlign:"center",marginTop:10,fontFamily:"'DM Mono',monospace"}}>
                  Expires {expiryDays==="Never"?"never":expiryDays+" days from now"} · Powered by SupTrack
                </div>
              </div>
            </div>}
          </div>
          <div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 16px",marginBottom:20}}>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>This link includes</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {STEPS.filter(s=>s.toggle!==false).map(s=>(
                <span key={s.id} style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:6,padding:"3px 10px",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
                  ✓ {s.label}
                </span>
              ))}
            </div>
          </div>

          {/* Email template */}
          <div style={{border:`1px solid ${t.border}`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
            <div style={{background:t.surfaceAlt,padding:"10px 14px",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <span>Email template</span>
              <button onClick={()=>{
                const email=`Subject: Welcome — please complete your SupTrack onboarding\n\n${customMessage||`Hi,\n\nI'm looking forward to working with you! Please complete your supervision onboarding at the link below — it only takes a few minutes.\n\n— ${supervisorName||"Your Supervisor"}`}\n\nOnboarding link: ${link}\n\nThis link expires ${expiryDays==="Never"?"and does not expire":("in "+expiryDays+" days")}.`;
                navigator.clipboard?.writeText(email);
              }} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace"}}>Copy email</button>
            </div>
            <div style={{padding:"12px 14px",fontSize:12,color:t.text,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
              {`${customMessage||`Hi,\n\nI'm looking forward to working with you! Please complete your supervision onboarding at the link below — it only takes a few minutes.\n\n— ${supervisorName||"Your Supervisor"}`}\n\n🔗 ${link}\n\nExpires: ${expiryDays==="Never"?"No expiry":expiryDays+" days"}`}
            </div>
          </div>

          <div style={{display:"flex",gap:10,justifyContent:"space-between"}}>
            <Btn T={t} variant="secondary" onClick={()=>setStep(1)}>← Back</Btn>
            <Btn T={t} onClick={copy}>{copied?"✓ Copied!":"Copy link"}</Btn>
          </div>
        </div>}

      </div>
    </div>
  </div>;
}

// ── Public profile page ────────────────────────────────────────────────────
function PublicProfilePage({supervisorPhoto,setSupervisorPhoto,supervisorName:supName,setSupervisorName,supervisorInitials,T}) {
  const t=T||THEMES.sage;
  const [editing,setEditing]=useState(false);
  const [newSpecialty,setNewSpecialty]=useState("");
  const [profile,setProfile]=useState({
    name:       supName ? `${supName}, LPC-S` : "Your Name, LPC-S",
    tagline:    "Licensed Professional Counselor-Supervisor · Quest Counseling",
    bio:        "Experienced LPC-S with 10+ years in behavioral health, specializing in trauma, co-occurring disorders, and motivational interviewing. I provide individual and group supervision for LPC-Interns and practicum students. My supervision style is collaborative, strengths-based, and grounded in evidence-based practice.",
    credential: "LPC-S",
    licenseNumber: "TX-LPC-123456",
    licenseState: "TX",
    credentialBody: "Texas State Board of Examiners",
    yearsExperience: "10+",
    supervisionStyle: "Collaborative, strengths-based, evidence-based",
    specialties: ["Trauma / PTSD","Co-occurring Disorders","Motivational Interviewing","DBT","Adolescent & Young Adult","Behavioral Health"],
    accepting: true, acceptingStudents: true, acceptingLicensed: true,
    feeIndividual: 200, feeGroup: 60,
    feeIndividualUnit: "month", feeGroupUnit: "session",
    location: "Reno, NV",
    telehealth: true, inPerson: true,
    languages: ["English"],
    maxSupervisees: 10,
  });

  const ALL_SPECIALTY_SUGGESTIONS = [
    "Trauma / PTSD","EMDR","Somatic Therapy","Grief & Loss","Anxiety & Depression",
    "Substance Use / SUD","Co-occurring Disorders","DBT","CBT","ACT","Motivational Interviewing",
    "Adolescent & Young Adult","Child & Family","Couples & Relationships","Perinatal Mental Health",
    "LGBTQ+ Affirming","Multicultural / BIPOC","Faith-Based","Eating Disorders","OCD",
    "Autism / Neurodivergence","Crisis Intervention","School-Based","Community Mental Health",
    "Telehealth","Group Therapy","Behavioral Health","Forensic / Criminal Justice",
  ];

  const p = (key,val) => setProfile(prev=>({...prev,[key]:val}));
  const inp = (key) => ({
    value: profile[key],
    onChange: e => p(key, e.target.value),
    style: {width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"},
  });

  const addSpecialty = (s) => {
    if(!s.trim()||profile.specialties.includes(s.trim())) return;
    p("specialties",[...profile.specialties, s.trim()]);
    setNewSpecialty("");
  };
  const removeSpecialty = (s) => p("specialties", profile.specialties.filter(x=>x!==s));

  const Section = ({title,children}) => <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:14}}>{title}</div>
    {children}
  </div>;

  const Field = ({label,children}) => <div style={{marginBottom:12}}>
    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>{label}</div>
    {children}
  </div>;

  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:24}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Public Profile</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>How interns find you on SupTrack · <span style={{fontFamily:"'DM Mono',monospace",fontSize:12}}>suptrack.io/supervisor/{(supName||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"") || "your-name"}</span></p>
      </div>
      <Btn T={t} onClick={()=>setEditing(e=>!e)}>{editing?"✓ Save profile":"Edit profile"}</Btn>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"1fr .42fr",gap:18,alignItems:"start"}}>

      {/* ── LEFT COLUMN ── */}
      <div>
        {/* Identity */}
        <Section title="Identity">
          <div style={{display:"flex",gap:16,marginBottom:16,alignItems:"flex-start"}}>
            <Avatar initials={supervisorInitials||"??"} size={72} T={t} photo={supervisorPhoto} editable={editing} onPhotoChange={setSupervisorPhoto}/>
            <div style={{flex:1}}>
              {editing
                ? <input {...inp("name")} style={{...inp("name").style,fontSize:18,marginBottom:8}}/>
                : <div style={{fontSize:22,color:t.text,fontWeight:500,marginBottom:4}}>{profile.name}</div>}
              {editing
                ? <input {...inp("tagline")} placeholder="Title · Organization"/>
                : <div style={{fontSize:13,color:t.muted}}>{profile.tagline}</div>}
            </div>
          </div>
          <Field label="Bio">
            {editing
              ? <div>
                  <textarea value={profile.bio} onChange={e=>p("bio",e.target.value)}
                    style={{width:"100%",minHeight:110,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.7}}/>
                  <div style={{fontSize:11,color:t.faint,textAlign:"right",marginTop:3,fontFamily:"'DM Mono',monospace"}}>{profile.bio.length} chars</div>
                </div>
              : <p style={{fontSize:13,color:t.text,lineHeight:1.7,margin:0}}>{profile.bio}</p>}
          </Field>
          {editing&&<Field label="Supervision style / approach">
            <input {...inp("supervisionStyle")} placeholder="e.g. Collaborative, strengths-based, DBT-informed"/>
          </Field>}
        </Section>

        {/* Credentials */}
        <Section title="Credentials & License">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Field label="Credential / License type">
              {editing ? <input {...inp("credential")} placeholder="e.g. LPC-S, LCSW-S"/>
                : <div style={{fontSize:14,color:t.text,fontWeight:500}}>{profile.credential}</div>}
            </Field>
            <Field label="License number">
              {editing ? <input {...inp("licenseNumber")} placeholder="e.g. TX-LPC-123456"/>
                : <div style={{fontSize:14,color:t.text,fontFamily:"'DM Mono',monospace"}}>{profile.licenseNumber}</div>}
            </Field>
            <Field label="State / Jurisdiction">
              {editing ? <input {...inp("licenseState")} placeholder="e.g. TX, CA, NY"/>
                : <div style={{fontSize:14,color:t.text}}>{profile.licenseState}</div>}
            </Field>
            <Field label="Years of experience">
              {editing ? <input {...inp("yearsExperience")} placeholder="e.g. 10+"/>
                : <div style={{fontSize:14,color:t.text}}>{profile.yearsExperience} years</div>}
            </Field>
          </div>
          <Field label="Credentialing body">
            {editing ? <input {...inp("credentialBody")} placeholder="e.g. Texas State Board of Examiners"/>
              : <div style={{fontSize:13,color:t.muted}}>{profile.credentialBody}</div>}
          </Field>
        </Section>

        {/* Specialties */}
        <Section title="Specialties">
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:editing?12:0}}>
            {profile.specialties.map(s=>(
              <div key={s} style={{display:"flex",alignItems:"center",gap:4,background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:20,padding:"4px 12px"}}>
                <span style={{fontSize:13,color:t.accentText}}>{s}</span>
                {editing&&<button onClick={()=>removeSpecialty(s)} style={{background:"none",border:"none",cursor:"pointer",color:t.accentText,fontSize:13,padding:0,lineHeight:1,marginLeft:2,opacity:0.6}}>✕</button>}
              </div>
            ))}
            {profile.specialties.length===0&&!editing&&<div style={{fontSize:13,color:t.faint}}>No specialties added yet.</div>}
          </div>

          {editing&&<div>
            {/* Quick-add from suggestions */}
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Quick add</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {ALL_SPECIALTY_SUGGESTIONS.filter(s=>!profile.specialties.includes(s)).map(s=>(
                <button key={s} onClick={()=>addSpecialty(s)}
                  style={{background:t.surfaceAlt,color:t.muted,border:`1px solid ${t.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",fontSize:12,fontFamily:"inherit",transition:"all 0.1s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=t.accentLight;e.currentTarget.style.color=t.accentText;e.currentTarget.style.borderColor=t.accentMid;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=t.surfaceAlt;e.currentTarget.style.color=t.muted;e.currentTarget.style.borderColor=t.border;}}>
                  + {s}
                </button>
              ))}
            </div>
            {/* Custom specialty */}
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Or type your own</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newSpecialty} onChange={e=>setNewSpecialty(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){addSpecialty(newSpecialty);}}}
                placeholder="Custom specialty..."
                style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 12px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none"}}/>
              <Btn T={t} small onClick={()=>addSpecialty(newSpecialty)}>Add</Btn>
            </div>
          </div>}
        </Section>
      </div>

      {/* ── RIGHT COLUMN ── */}
      <div>
        {/* Fees */}
        <Section title="Supervision fees">
          <Field label="Individual supervision">
            {editing
              ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14,color:t.muted}}>$</span>
                  <input type="number" value={profile.feeIndividual} onChange={e=>p("feeIndividual",Number(e.target.value))}
                    style={{width:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
                  <span style={{fontSize:13,color:t.muted}}>/</span>
                  <select value={profile.feeIndividualUnit} onChange={e=>p("feeIndividualUnit",e.target.value)}
                    style={{border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:13,color:t.text,background:t.bg,outline:"none",cursor:"pointer"}}>
                    {["month","session","hour"].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              : <div style={{fontSize:20,color:t.text,fontWeight:500}}>${profile.feeIndividual}<span style={{fontSize:12,color:t.muted,fontWeight:400}}>/{profile.feeIndividualUnit}</span></div>}
          </Field>
          <Field label="Group supervision (per intern)">
            {editing
              ? <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:14,color:t.muted}}>$</span>
                  <input type="number" value={profile.feeGroup} onChange={e=>p("feeGroup",Number(e.target.value))}
                    style={{width:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
                  <span style={{fontSize:13,color:t.muted}}>/</span>
                  <select value={profile.feeGroupUnit} onChange={e=>p("feeGroupUnit",e.target.value)}
                    style={{border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:13,color:t.text,background:t.bg,outline:"none",cursor:"pointer"}}>
                    {["session","month","hour"].map(u=><option key={u}>{u}</option>)}
                  </select>
                </div>
              : <div style={{fontSize:20,color:t.text,fontWeight:500}}>${profile.feeGroup}<span style={{fontSize:12,color:t.muted,fontWeight:400}}>/{profile.feeGroupUnit}</span></div>}
          </Field>
          {editing&&<div style={{background:t.surfaceAlt,borderRadius:8,padding:"8px 12px",fontSize:12,color:t.muted,lineHeight:1.6}}>
            Fees shown on your public profile help interns find the right fit before reaching out.
          </div>}
        </Section>

        {/* Accepting */}
        <Section title="Accepting supervisees">
          {[["Student Interns / Practicum","acceptingStudents"],["State Licensed Interns","acceptingLicensed"]].map(([label,key])=>(
            <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:13,color:t.text}}>{label}</span>
              <button onClick={()=>editing&&p(key,!profile[key])}
                style={{background:profile[key]?t.accent:t.border,border:"none",borderRadius:12,width:36,height:20,cursor:editing?"pointer":"default",position:"relative",transition:"background 0.15s"}}>
                <span style={{position:"absolute",top:2,left:profile[key]?18:2,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.15s"}}/>
              </button>
            </div>
          ))}
          {editing&&<Field label="Max supervisees">
            <input type="number" value={profile.maxSupervisees} onChange={e=>p("maxSupervisees",Number(e.target.value))}
              style={{width:80,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 10px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
          </Field>}
        </Section>

        {/* Logistics */}
        <Section title="Location & format">
          <Field label="Location">
            {editing ? <input {...inp("location")} placeholder="City, State"/>
              : <div style={{fontSize:13,color:t.text}}>{profile.location}</div>}
          </Field>
          <div style={{display:"flex",gap:8}}>
            {[["Telehealth","telehealth"],["In-person","inPerson"]].map(([label,key])=>(
              <button key={key} onClick={()=>editing&&p(key,!profile[key])}
                style={{flex:1,background:profile[key]?t.accentLight:t.surfaceAlt,color:profile[key]?t.accentText:t.muted,border:`1px solid ${profile[key]?t.accentMid:t.border}`,borderRadius:8,padding:"7px 0",cursor:editing?"pointer":"default",fontSize:13,transition:"all 0.15s"}}>
                {profile[key]?"✓ ":""}{label}
              </button>
            ))}
          </div>
        </Section>

        {/* Live URL */}
        <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:12,padding:"14px 16px",fontSize:13,color:t.accentText,lineHeight:1.7}}>
          🌐 Live at:<br/>
          <span style={{fontFamily:"'DM Mono',monospace",fontSize:11}}>suptrack.io/supervisor/{(supName||"").toLowerCase().replace(/\s+/g,"-").replace(/[^a-z0-9-]/g,"") || "your-name"}</span><br/><br/>
          Interns searching for supervisors can find your profile and send a request directly to your SupTrack inbox.
        </div>
      </div>
    </div>
  </div>;
}

// ── Calendar page ──────────────────────────────────────────────────────────
function CalendarPage({T}) {
  const t=T||THEMES.sage;
  const [connected,setConnected]=useState(false);
  const [sessions,setSessions]=useState([
    {intern:"Marissa",date:"Mar 25, 2026",time:"2:00 PM",type:"Individual",duration:"60 min",logged:false},
    {intern:"Dev",    date:"Mar 25, 2026",time:"4:00 PM",type:"Group",     duration:"90 min",logged:false},
    {intern:"Priya",  date:"Mar 26, 2026",time:"10:00 AM",type:"Individual",duration:"60 min",logged:false},
    {intern:"Dev",    date:"Apr 1, 2026", time:"2:00 PM",type:"Individual",duration:"60 min",logged:false},
  ]);
  const markLogged=(i)=>setSessions(p=>p.map((s,idx)=>idx===i?{...s,logged:true}:s));
  return <div>
    <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Calendar</h1>
    <p style={{color:t.muted,fontSize:14,margin:"0 0 24px"}}>Connect your calendar — supervision sessions auto-populate for one-click logging</p>
    {!connected?<div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"40px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontSize:36,marginBottom:12}}>📅</div>
      <div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:8}}>Connect your calendar</div>
      <div style={{fontSize:14,color:t.muted,marginBottom:24,maxWidth:400,margin:"0 auto 24px"}}>When you schedule supervision sessions in your calendar, SupTrack pulls them in automatically. One click logs the session and opens the AI note writer.</div>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        {[["Google Calendar","#4285F4"],["Outlook","#0078D4"],["Apple Calendar","#1A1A1A"]].map(([name,color])=>(
          <button key={name} onClick={()=>setConnected(true)} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontSize:13,color:t.text,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{width:12,height:12,borderRadius:"50%",background:color}}/>{name}
          </button>
        ))}
      </div>
    </div>:<div>
      <div style={{background:S.greenLight,border:`1px solid #C4DFCC`,borderRadius:10,padding:"11px 16px",marginBottom:20,fontSize:13,color:S.green}}>✓ Google Calendar connected — sessions sync automatically</div>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:14}}>Upcoming sessions</div>
      {sessions.map((s,i)=><div key={i} style={{background:t.surface,border:`1px solid ${s.logged?t.borderLight:t.border}`,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",gap:14,opacity:s.logged?0.55:1,boxShadow:"0 1px 3px rgba(0,0,0,0.04)",marginBottom:10}}>
        <div style={{flex:1}}><div style={{fontSize:14,color:t.text,marginBottom:3}}>{s.intern} · {s.type} supervision</div><div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{s.date} · {s.time} · {s.duration}</div></div>
        {s.logged?<Badge color={S.green} bg={S.greenLight}>Logged</Badge>:<button onClick={()=>markLogged(i)} style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>✦ Log with AI</button>}
      </div>)}
    </div>}
  </div>;
}

// ── Settings Page ──────────────────────────────────────────────────────────

const PLANS = {
  starter: {
    id:"starter", name:"Starter", monthly:24.99, annual:249.90,
    internLimit:"1–10 active interns", internMax:10,
    badge:null,
    tagline:"Get organized and stop losing track",
    features:[
      "Hour tracking & intern portal",
      "Session logging & notes",
      "Basic document storage",
      "Payment tracking",
      "Groups & lists",
      "14-day free trial",
    ],
    limits:["Basic reporting only","No discrepancy detection","No audit exports"],
    color:"#5B7B5E", colorLight:"#EEF4EE",
  },
  growth: {
    id:"growth", name:"Growth", monthly:39.99, annual:399.90,
    internLimit:"10–20 active interns", internMax:20,
    badge:"⭐ Most popular",
    tagline:"\"I don't have to worry about my supervision anymore\"",
    features:[
      "Everything in Starter",
      "Discrepancy detection & board export",
      "Audit-ready hour reports & board exports",
      "Payment tracking with reminders",
      "Colleague sharing & permissions",
      "AI session notes & consultation",
      "Priority support",
    ],
    limits:[],
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  practice: {
    id:"practice", name:"Practice", monthly:69.99, annual:699.90,
    internLimit:"Unlimited interns", internMax:999,
    badge:"🏢 For group practices",
    tagline:"Scale your supervision without the chaos",
    features:[
      "Everything in Growth",
      "Unlimited interns",
      "Multi-supervisor support",
      "Supervisor onboarding & setup",
      "Annual tax export package",
      "Dedicated account support",
      "Custom categories & workflows",
    ],
    limits:[],
    color:"#6B3FA0", colorLight:"#F2EDFB",
  },
};

const PLAN_HEADLINE = "Track supervision hours, eliminate discrepancies, generate audit-ready reports, and get paid — all in one system.";


const SEAT_PRICE_MONTHLY = 9.99;
const SEAT_PRICE_ANNUAL  = 99.90;

// ── BillingPage ────────────────────────────────────────────────────────────
function BillingPage({billing,setBilling,interns,T,F,colleagues=[]}) {
  const t=T||THEMES.sage;
  const [tab,setTab]=useState("plan");
  const [cycle,setCycle]=useState(billing.cycle);
  const [copied,setCopied]=useState(false);
  const [addingSeat,setAddingSeat]=useState(false);
  const [newSeatEmail,setNewSeatEmail]=useState("");
  const [showPricing,setShowPricing]=useState(false);
  const [showPaymentModal,setShowPaymentModal]=useState(false);
  const [paymentForm,setPaymentForm]=useState({cardNumber:"",expiry:"",cvc:"",name:"",zip:""});
  const [paymentSaved,setPaymentSaved]=useState(false);

  const activeInterns = interns.filter(i=>i.status==="active").length;
  const currentPlan   = PLANS[billing.plan];
  const extraSeats    = billing.seats.filter(s=>s.role!=="owner").length;
  const seatPrice     = cycle==="annual" ? SEAT_PRICE_ANNUAL : SEAT_PRICE_MONTHLY * 12;
  const basePrice     = cycle==="annual" ? currentPlan.annual : currentPlan.monthly;
  const totalMonthly  = currentPlan.monthly + (extraSeats * SEAT_PRICE_MONTHLY);
  const totalAnnual   = currentPlan.annual  + (extraSeats * SEAT_PRICE_ANNUAL);

  const suggestedPlan = activeInterns <= 10 ? "starter" : activeInterns <= 20 ? "growth" : "practice";

  const copyReferral = () => {
    navigator.clipboard?.writeText(`https://app.suptrack.io/signup?ref=${billing.referralCode}`);
    setCopied(true); setTimeout(()=>setCopied(false),2000);
  };

  const tabs = ["plan","seats","referrals","founding"];
  const tabLabel = {plan:"Plan & Usage", seats:"Team Seats", referrals:"Referrals", founding:"Founding Supervisors"};

  const Card = ({children,style={}}) => <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",...style}}>{children}</div>;
  const Label = ({children}) => <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>{children}</div>;

  return <div>
    <div style={{marginBottom:26}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Plan & Billing</h1>
      <p style={{color:t.muted,fontSize:14,margin:0}}>Manage your subscription, team seats, and referrals</p>
    </div>

    {/* Payment method modal */}
    {showPaymentModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowPaymentModal(false)}>
      <div style={{background:t.surface,borderRadius:18,padding:"28px 32px",width:460,boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:2}}>Add payment method</div>
            <div style={{fontSize:13,color:t.muted}}>Your card won't be charged until your trial ends.</div>
          </div>
          <button onClick={()=>setShowPaymentModal(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.faint}}>✕</button>
        </div>
        {paymentSaved
          ? <div style={{textAlign:"center",padding:"24px 0"}}>
              <div style={{fontSize:40,marginBottom:12}}>✅</div>
              <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:6}}>Payment method saved!</div>
              <div style={{fontSize:13,color:t.muted,marginBottom:20}}>You're all set. You won't be charged until your trial ends on {billing.nextBilling}.</div>
              <button onClick={()=>{setShowPaymentModal(false);setPaymentSaved(false);setBilling(p=>({...p,trialDaysLeft:0,hasPaymentMethod:true}));}}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:10,padding:"10px 28px",cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>Done</button>
            </div>
          : <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {/* Card number */}
              <div>
                <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Card number</div>
                <input value={paymentForm.cardNumber} onChange={e=>setPaymentForm(p=>({...p,cardNumber:e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim()}))}
                  placeholder="1234 5678 9012 3456" maxLength={19}
                  style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Expiry</div>
                  <input value={paymentForm.expiry} onChange={e=>{let v=e.target.value.replace(/\D/g,"").slice(0,4);if(v.length>=3)v=v.slice(0,2)+"/"+v.slice(2);setPaymentForm(p=>({...p,expiry:v}));}}
                    placeholder="MM/YY" maxLength={5}
                    style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>CVC</div>
                  <input value={paymentForm.cvc} onChange={e=>setPaymentForm(p=>({...p,cvc:e.target.value.replace(/\D/g,"").slice(0,4)}))}
                    placeholder="123" maxLength={4}
                    style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:6}}>Name on card</div>
                <input value={paymentForm.name} onChange={e=>setPaymentForm(p=>({...p,name:e.target.value}))}
                  placeholder="Alyson K."
                  style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{background:t.surfaceAlt,borderRadius:8,padding:"10px 14px",fontSize:12,color:t.muted,display:"flex",alignItems:"center",gap:8}}>
                <span>🔒</span> Payments processed securely via Stripe. SupTrack never stores your card details.
              </div>
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <button onClick={()=>{if(!paymentForm.cardNumber||!paymentForm.expiry||!paymentForm.cvc||!paymentForm.name)return;setPaymentSaved(true);}}
                  style={{flex:1,background:t.isGradient?t.gradient:t.accent,backgroundSize:t.isGradient?"200% 200%":undefined,animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",border:"none",borderRadius:10,padding:"11px 0",cursor:"pointer",fontSize:14,fontWeight:500,fontFamily:"inherit"}}>
                  Save payment method
                </button>
                <button onClick={()=>setShowPaymentModal(false)}
                  style={{background:"none",border:`1px solid ${t.border}`,borderRadius:10,padding:"11px 20px",cursor:"pointer",fontSize:14,color:t.muted,fontFamily:"inherit"}}>
                  Cancel
                </button>
              </div>
            </div>}
      </div>
    </div>}

    {/* Trial banner */}
    {billing.trialDaysLeft > 0 && (
      <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:12,padding:"14px 20px",marginBottom:22,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <span style={{fontSize:14,color:t.accentText,fontWeight:500}}>Free trial — {billing.trialDaysLeft} days remaining</span>
          <span style={{fontSize:13,color:t.accentText,marginLeft:12}}>No credit card charged until your trial ends.</span>
        </div>
        <button onClick={()=>setShowPaymentModal(true)} style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>Add payment method</button>
      </div>
    )}

    {/* Credits banner */}
    {billing.credits > 0 && (
      <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:12,padding:"12px 20px",marginBottom:22,fontSize:13,color:t.accentText}}>
        🎁 You have <strong>{billing.credits} free month{billing.credits>1?"s":""}</strong> of credit — applied automatically to your next billing cycle.
      </div>
    )}

    {/* Tab nav */}
    <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,marginBottom:24}}>
      {tabs.map(tt=><button key={tt} onClick={()=>setTab(tt)} style={{background:"none",border:"none",borderBottom:tab===tt?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 16px",cursor:"pointer",fontSize:13,color:tab===tt?t.accent:t.muted,fontFamily:"'DM Mono',monospace",marginBottom:-1}}>{tabLabel[tt]}</button>)}
    </div>

    {/* ── Plan tab ── */}
    {tab==="plan" && <div style={{display:"flex",flexDirection:"column",gap:18}}>

      {/* Current plan summary */}
      <Card>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:16}}>
          <div>
            <Label>Current plan</Label>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontFamily:"inherit",fontSize:22,color:t.text}}>{currentPlan.name}</span>
              <Badge color={currentPlan.color} bg={currentPlan.colorLight}>{currentPlan.internLimit}</Badge>
              <Badge color={t.muted} bg={t.surfaceAlt}>{billing.cycle}</Badge>
            </div>
            <div style={{fontSize:13,color:t.muted}}>
              {billing.trialDaysLeft > 0 ? "Free trial — " : "Next billing: "}{billing.trialDaysLeft > 0 ? `${billing.trialDaysLeft} days left` : billing.nextBilling}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"inherit",fontSize:28,color:t.accent,lineHeight:1}}>${billing.cycle==="annual"?(currentPlan.annual/12).toFixed(2):currentPlan.monthly}<span style={{fontSize:14,color:t.muted}}>/mo</span></div>
            {billing.cycle==="annual"&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>${currentPlan.annual}/yr · 2 months free</div>}
          </div>
        </div>

        {/* Usage bar */}
        <div style={{marginTop:18,paddingTop:16,borderTop:`1px solid ${t.borderLight}`}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:13,color:t.text}}>Active interns</span>
            <span style={{fontSize:13,color:activeInterns>currentPlan.internMax?S.red:t.accent,fontFamily:"'DM Mono',monospace"}}>{activeInterns} / {currentPlan.internMax === 999 ? "∞" : currentPlan.internMax}</span>
          </div>
          <div style={{height:8,background:t.borderLight,borderRadius:999,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(100,currentPlan.internMax===999?20:(activeInterns/currentPlan.internMax)*100)}%`,background:activeInterns>currentPlan.internMax*0.9?S.amber:t.accent,borderRadius:999,transition:"width 0.6s ease"}}/>
          </div>
          {suggestedPlan !== billing.plan && <div style={{fontSize:12,color:S.amber,marginTop:6}}>You're approaching your limit — consider upgrading to {PLANS[suggestedPlan].name}.</div>}
        </div>
      </Card>

      {/* Billing cycle toggle */}
      <Card>
        <Label>Billing cycle</Label>
        <div style={{display:"flex",gap:10,marginBottom:16}}>
          {["monthly","annual"].map(c=><button key={c} onClick={()=>setCycle(c)} style={{background:cycle===c?t.accentLight:"none",color:cycle===c?t.accentText:t.muted,border:`1px solid ${cycle===c?t.accentMid:t.border}`,borderRadius:10,padding:"10px 20px",cursor:"pointer",fontSize:14,fontFamily:"'DM Mono',monospace",position:"relative"}}>
            {c.charAt(0).toUpperCase()+c.slice(1)}
            {c==="annual"&&<span style={{marginLeft:8,fontSize:11,background:S.greenLight,color:S.green,borderRadius:4,padding:"2px 6px",fontFamily:"'DM Mono',monospace"}}>2 months free</span>}
          </button>)}
        </div>
        <div style={{fontSize:13,color:t.muted}}>
          {cycle==="annual" ? `Billed $${totalAnnual.toFixed(2)}/yr — you save $${((totalMonthly*12)-totalAnnual).toFixed(2)} compared to monthly.` : `Billed $${totalMonthly.toFixed(2)}/mo. Switch to annual to save $${((totalMonthly*12)-totalAnnual).toFixed(2)}/yr.`}
        </div>
      </Card>

      {/* Plan cards */}
      <div>
        <div style={{fontSize:14,color:t.text,marginBottom:14,fontWeight:500}}>All plans — click to switch</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14}}>
          {Object.values(PLANS).map(plan=>{
            const active=plan.id===billing.plan;
            const price=cycle==="annual"?plan.annual/12:plan.monthly;
            return <div key={plan.id} onClick={()=>setBilling(p=>({...p,plan:plan.id,cycle}))}
              style={{background:active?plan.colorLight:t.surface,border:`2px solid ${active?plan.color:t.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer",transition:"all 0.15s",display:"flex",flexDirection:"column",textAlign:"left"}}>
              {/* Badge row — always reserves height so all three cards align */}
              <div style={{height:24,marginBottom:6,display:"flex",alignItems:"center"}}>
                {plan.badge&&<span style={{fontSize:11,color:plan.color,background:plan.colorLight,border:`1px solid ${plan.color}40`,borderRadius:20,padding:"2px 10px",fontFamily:"'DM Mono',monospace",fontWeight:500}}>{plan.badge}</span>}
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <span style={{fontFamily:"inherit",fontSize:17,color:t.text,fontWeight:500}}>{plan.name}</span>
                {active&&<Badge color={plan.color} bg={active?plan.colorLight+"80":"transparent"}>Current</Badge>}
              </div>
              <div style={{fontFamily:"inherit",fontSize:24,color:active?plan.color:t.text,marginBottom:4}}>${price.toFixed(2)}<span style={{fontSize:13,color:t.muted,fontWeight:400}}>/mo</span></div>
              {cycle==="annual"&&<div style={{fontSize:12,color:t.muted,marginBottom:10}}>${plan.annual}/yr</div>}
              <div style={{fontSize:12,color:t.muted,marginBottom:14,fontFamily:"'DM Mono',monospace"}}>{plan.internLimit}</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,flex:1}}>
                {plan.features.map(f=><div key={f} style={{fontSize:12,color:t.muted,display:"flex",gap:6,alignItems:"flex-start"}}>
                  <span style={{color:plan.color,flexShrink:0}}>✓</span>{f}
                </div>)}
              </div>
            </div>;
          })}
        </div>
      </div>

      {/* Additional seats pricing note */}
      <Card style={{background:t.surfaceAlt}}>
        <div style={{fontSize:13,color:t.muted}}>Additional supervisor seats — <strong style={{color:t.text}}>${SEAT_PRICE_MONTHLY}/mo</strong> each ({cycle==="annual"?`$${SEAT_PRICE_ANNUAL}/yr · 2 months free`:"switch to annual to save"}). Manage seats in the Team Seats tab.</div>
      </Card>
    </div>}

    {/* ── Seats tab ── */}
    {tab==="seats" && <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
          <div>
            <Label>Team seats</Label>
            <div style={{fontSize:13,color:t.muted}}>{billing.seats.length} seat{billing.seats.length!==1?"s":""} · ${(extraSeats*SEAT_PRICE_MONTHLY).toFixed(2)}/mo for additional supervisors</div>
          </div>
          <Btn T={t} small onClick={()=>setAddingSeat(true)}>+ Invite supervisor</Btn>
        </div>

        {addingSeat && (
          <div style={{background:t.surfaceAlt,borderRadius:10,padding:"14px 16px",marginBottom:16}}>
            <div style={{fontSize:13,color:t.text,marginBottom:10}}>Invite by email — they'll receive a link to create their account under your plan</div>
            <div style={{display:"flex",gap:8}}>
              <input value={newSeatEmail} onChange={e=>setNewSeatEmail(e.target.value)} placeholder="colleague@email.com"
                style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.surface,outline:"none"}}/>
              <Btn T={t} small onClick={()=>{if(!newSeatEmail.trim())return;setBilling(p=>({...p,seats:[...p.seats,{id:`s${Date.now()}`,name:newSeatEmail.split("@")[0],email:newSeatEmail.trim(),role:"member",since:TODAY_MONTH()}]}));setNewSeatEmail("");setAddingSeat(false);}}>Send invite</Btn>
              <Btn T={t} variant="secondary" small onClick={()=>{setAddingSeat(false);setNewSeatEmail("");}}>Cancel</Btn>
            </div>
            <div style={{fontSize:12,color:t.muted,marginTop:8}}>+${SEAT_PRICE_MONTHLY}/mo added to your bill. Prorated for the current billing cycle.</div>
          </div>
        )}

        {billing.seats.map((seat,i)=>(
          <div key={seat.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:i>0?`1px solid ${t.borderLight}`:"none"}}>
            <Avatar initials={seat.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()} size={38} T={t}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{fontSize:14,color:t.text,fontWeight:500}}>{seat.name}</div>
                {seat.role==="admin"&&<Badge color="#6B3FA0" bg="#F2EDFB">🔒 Admin</Badge>}
              </div>
              <div style={{fontSize:12,color:t.muted,marginTop:1}}>{seat.email}{seat.since?` · Added ${seat.since}`:""}</div>
            </div>
            {seat.role==="owner"
              ? <div style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace",minWidth:60,textAlign:"right"}}>Plan owner</div>
              : <div style={{display:"flex",alignItems:"center",gap:8}}>
                  {/* Admin toggle */}
                  <button onClick={()=>setBilling(p=>({...p,seats:p.seats.map(s=>s.id!==seat.id?s:{...s,role:s.role==="admin"?"member":"admin"})}))}
                    style={{background:seat.role==="admin"?"#F2EDFB":t.surfaceAlt,color:seat.role==="admin"?"#6B3FA0":t.muted,border:`1px solid ${seat.role==="admin"?"#C4A8F0":t.border}`,borderRadius:7,padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",transition:"all 0.15s"}}>
                    {seat.role==="admin"?"Admin ✓":"Make admin"}
                  </button>
                  <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>${SEAT_PRICE_MONTHLY}/mo</div>
                  <button onClick={()=>setBilling(p=>({...p,seats:p.seats.filter(s=>s.id!==seat.id)}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>Remove</button>
                </div>}
          </div>
        ))}
      </Card>

      <Card style={{background:t.surfaceAlt}}>
        <div style={{fontSize:13,color:t.muted,lineHeight:1.7}}>
          Each additional supervisor gets their own independent dashboard, interns, groups, and lists. Sharing between supervisors uses the permission system you've already set up — you control exactly what each colleague can see and do.
        </div>
      </Card>
    </div>}

    {/* ── Referrals tab ── */}
    {tab==="referrals" && <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Milestone progress — each tier is completely independent */}
      {(()=>{
        const tp = billing.tierProgress || {};
        const TIERS = [
          { num:1, required:1,  reward:"1 month free",  icon:"🎁", color:"#7B9FD4", bg:"#EEF2FA", desc:"Your very first paid referral" },
          { num:2, required:3,  reward:"1 month free",  icon:"🎉", color:"#88B8A0", bg:"#EEF8F2", desc:"3 separate paid referrals" },
          { num:3, required:10, reward:"3 months free", icon:"⭐", color:"#A088C8", bg:"#F0EBF9", desc:"10 separate paid referrals" },
          { num:4, required:25, reward:"1 year free",   icon:"🏆", color:"#E8A878", bg:"#FDF5EE", desc:"25 separate paid referrals" },
        ];

        return <Card>
          <Label>Your reward tiers</Label>
          <div style={{fontSize:13,color:t.muted,marginBottom:16,lineHeight:1.6}}>
            Each tier is <strong style={{color:t.text}}>completely independent</strong> — the same referral only counts toward one tier. You need fresh signups for each.
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {TIERS.map(tier=>{
              const prog = tp[tier.num] || {required:tier.required, earned:0, referrals:[], unlocked:false};
              const pct = Math.min(100, Math.round((prog.earned/tier.required)*100));
              const unlocked = prog.unlocked || prog.earned >= tier.required;
              return <div key={tier.num} style={{background:unlocked?`${tier.color}12`:t.surfaceAlt,border:`1px solid ${unlocked?tier.color+"40":t.border}`,borderRadius:12,padding:"14px 16px",transition:"all 0.2s"}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:unlocked?0:10}}>
                  <div style={{width:38,height:38,borderRadius:10,background:tier.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{tier.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <span style={{fontSize:14,color:t.text,fontWeight:500}}>{tier.reward}</span>
                      <span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{tier.desc}</span>
                    </div>
                    {!unlocked&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>
                      {prog.earned} of {tier.required} referrals · {tier.required-prog.earned} more needed
                    </div>}
                  </div>
                  {unlocked
                    ? <Badge color={tier.color} bg={tier.bg}>✓ Unlocked!</Badge>
                    : <span style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace",flexShrink:0}}>{prog.earned}/{tier.required}</span>}
                </div>
                {/* Progress bar — only shown when not yet unlocked */}
                {!unlocked&&<div style={{height:5,background:t.borderLight,borderRadius:999,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:tier.color,borderRadius:999,transition:"width 0.6s ease"}}/>
                </div>}
              </div>;
            })}
          </div>
          <div style={{fontSize:12,color:t.muted,marginTop:12,lineHeight:1.6}}>
            Rewards are applied automatically when each tier is reached. Credits don't expire. The same person can't count toward multiple tiers.
          </div>
        </Card>;
      })()}

      {/* Referral link */}
      <Card>
        <Label>Your referral link</Label>
        <div style={{fontSize:13,color:t.muted,marginBottom:14,lineHeight:1.6}}>
          When someone signs up with your link, they get their <strong style={{color:t.text}}>first month free</strong>. You earn credit toward your reward tiers when they pay.
        </div>
        <div style={{display:"flex",gap:10,marginBottom:12}}>
          <div style={{flex:1,background:t.surfaceAlt,borderRadius:10,padding:"11px 14px",fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
            https://app.suptrack.io/signup?ref={billing.referralCode}
          </div>
          <button onClick={copyReferral} style={{background:copied?t.accent:t.surface,color:copied?"#fff":t.text,border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 20px",fontSize:13,cursor:"pointer",fontFamily:"'DM Mono',monospace",flexShrink:0,transition:"all 0.15s"}}>
            {copied?"✓ Copied":"Copy link"}
          </button>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["Copy for email","Share on LinkedIn","Send via text"].map(action=>(
            <button key={action} onClick={copyReferral} style={{background:t.surfaceAlt,color:t.muted,border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>{action}</button>
          ))}
        </div>
      </Card>

      {/* Referral history */}
      <Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <Label style={{margin:0}}>Referral history</Label>
          <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{billing.referrals.filter(r=>r.creditEarned).length} paid · {billing.referrals.filter(r=>!r.creditEarned).length} pending</div>
        </div>
        {billing.referrals.length===0&&<div style={{fontSize:14,color:t.muted}}>No referrals yet — share your link to get started.</div>}
        {billing.referrals.map((ref,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:i>0?`1px solid ${t.borderLight}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:ref.creditEarned?t.accentMid:t.surfaceAlt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:ref.creditEarned?t.accentText:t.muted,fontFamily:"'DM Mono',monospace",fontWeight:600,flexShrink:0}}>
              {ref.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{ref.name}</div>
              <div style={{fontSize:12,color:t.muted,marginTop:1}}>Joined {ref.joined}</div>
            </div>
            <Badge color={ref.creditEarned?t.accentText:S.amber} bg={ref.creditEarned?t.accentLight:S.amberLight}>
              {ref.creditEarned?"✓ Paid":"⏳ Trial"}
            </Badge>
          </div>
        ))}
      </Card>
    </div>}

    {/* ── Founding tab ── */}
    {tab==="founding" && <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <Card>
        <Label>Founding Supervisor accounts</Label>
        <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:6}}>5 permanent free accounts — yours to give</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:18,lineHeight:1.7}}>As the creator of SupTrack, you have {billing.foundingSlotsTotal} permanent free accounts to give to colleagues. They get full platform access forever, no billing required. These are yours to use however you'd like — colleagues, co-supervisors, people who helped build this.</div>
        <div style={{display:"flex",gap:12,marginBottom:20}}>
          <div style={{background:t.surfaceAlt,borderRadius:12,padding:"16px 20px",textAlign:"center",flex:1}}>
            <div style={{fontFamily:"inherit",fontSize:28,color:t.accent,lineHeight:1}}>{billing.foundingSeats.length}</div>
            <div style={{fontSize:12,color:t.muted,marginTop:4}}>Assigned</div>
          </div>
          <div style={{background:t.surfaceAlt,borderRadius:12,padding:"16px 20px",textAlign:"center",flex:1}}>
            <div style={{fontFamily:"inherit",fontSize:28,color:t.text,lineHeight:1}}>{billing.foundingSlotsTotal - billing.foundingSeats.length}</div>
            <div style={{fontSize:12,color:t.muted,marginTop:4}}>Available</div>
          </div>
          <div style={{background:t.accentLight,borderRadius:12,padding:"16px 20px",textAlign:"center",flex:1}}>
            <div style={{fontFamily:"inherit",fontSize:28,color:t.accent,lineHeight:1}}>{billing.foundingSlotsTotal}</div>
            <div style={{fontSize:12,color:t.muted,marginTop:4}}>Total slots</div>
          </div>
        </div>
        {billing.foundingSeats.map((seat,i)=>(
          <div key={seat.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:i>0?`1px solid ${t.borderLight}`:`1px solid ${t.borderLight}`}}>
            <Avatar initials={seat.name.split(" ").map(w=>w[0]).join("").slice(0,2)} size={38} T={t}/>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{seat.name}</div>
              <div style={{fontSize:12,color:t.muted,marginTop:1}}>{seat.email} · Founding access since {seat.since}</div>
            </div>
            <Badge color={t.accentText} bg={t.accentLight}>Founding · Free forever</Badge>
            <button onClick={()=>setBilling(p=>({...p,foundingSeats:p.foundingSeats.filter(s=>s.id!==seat.id)}))} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>Revoke</button>
          </div>
        ))}
        {billing.foundingSeats.length < billing.foundingSlotsTotal && (
          <div style={{marginTop:16}}>
            <div style={{display:"flex",gap:8}}>
              <input placeholder="colleague@email.com" id="founding-email"
                style={{flex:1,border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 12px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none"}}/>
              <Btn T={t} small onClick={()=>{
                const el=document.getElementById("founding-email"); if(!el?.value?.trim())return;
                const email=el.value.trim(); const name=email.split("@")[0];
                setBilling(p=>({...p,foundingSeats:[...p.foundingSeats,{id:`f${Date.now()}`,name,email,since:"Mar 2026"}]}));
                el.value="";
              }}>Grant free access</Btn>
            </div>
            <div style={{fontSize:12,color:t.muted,marginTop:8}}>{billing.foundingSlotsTotal - billing.foundingSeats.length} slot{billing.foundingSlotsTotal - billing.foundingSeats.length!==1?"s":""} remaining · They'll receive an invitation email automatically</div>
          </div>
        )}
      </Card>
      <Card style={{background:t.surfaceAlt}}>
        <div style={{fontSize:13,color:t.muted,lineHeight:1.7}}>Founding Supervisor accounts are a thank-you for the people who helped shape SupTrack. They're permanent, not tied to a billing cycle, and can be reassigned at any time. They show up in your platform as regular supervisor accounts — colleagues won't see any difference in their experience.</div>
      </Card>
    </div>}
  </div>;
}

// ── Consult AI ─────────────────────────────────────────────────────────────
const CONSULT_PROMPTS = [
  { label:"Struggling supervisee",    text:"I have a supervisee who is struggling. How do I approach this conversation?" },
  { label:"Ethical concern",          text:"I'm dealing with an ethical dilemma in supervision. Can you help me think through it?" },
  { label:"Gatekeeping question",     text:"I'm questioning whether a supervisee is ready to continue. How do I navigate this?" },
  { label:"Parallel process",         text:"I'm noticing what might be parallel process between my supervisee and their client. Help me explore this." },
  { label:"Documentation issue",      text:"My supervisee's documentation is consistently late or insufficient. How do I address this?" },
  { label:"Dual relationship concern",text:"A potential dual relationship issue has come up in supervision. How do I handle it?" },
  { label:"Countertransference",      text:"My supervisee is showing strong countertransference. How do I work with this in supervision?" },
  { label:"Crisis in caseload",       text:"My supervisee had a client crisis. How do I support them while also reviewing what happened?" },
];

function ConsultPage({interns,T,consultIntern}) {
  const t=T||THEMES.sage;
  const [messages,setMessages]=useState([]);
  const [input,setInput]=useState(consultIntern ? `I want to consult about a supervisee situation involving ${consultIntern.preferredName||consultIntern.name.split(" ")[0]} (${consultIntern.discipline||consultIntern.internType}, ${consultIntern.credential}). ` : "");
  const [loading,setLoading]=useState(false);
  const [hipaaAck,setHipaaAck]=useState(false);
  const [apiKey,setApiKey]=useState(()=>{const saved=localStorage.getItem("suptrack_api_key")||"";if(saved)window.__SUPTRACK_API_KEY=saved;return saved;});
  const [showKeyInput,setShowKeyInput]=useState(false);
  const [tempKey,setTempKey]=useState("");

  const activeInternSummary = interns.filter(i=>i.status==="active").map(i=>
    `- ${dn(i)} (${i.discipline||i.internType}, ${i.credential}, ${i.supervisorRole} intern, ${Math.round(i.hoursCompleted/i.hoursTotal*100)}% through hours)`
  ).join("\n");

  const systemPrompt = `You are an experienced clinical supervision consultant — think of yourself as a wise, seasoned LPC-S or LCSW-S with 20+ years of experience supervising across counseling, social work, MFT, and substance use disciplines. You provide thoughtful, clinically grounded consultation to supervisors on supervisory issues.

The supervisor you're speaking with is Alyson, an LPC-S. Her current active supervisees are:
${activeInternSummary}

Your role is to:
- Help Alyson think through supervisory challenges and dilemmas
- Offer concrete, practical guidance rooted in best practices for clinical supervision
- Reference supervision models (Bordin's Working Alliance, Developmental Models, Discrimination Model, etc.) when relevant
- Help with gatekeeping conversations, ethical dilemmas, documentation concerns, parallel process, countertransference in supervision, and difficult supervisory relationships
- Ask clarifying questions when needed before offering guidance
- Be direct and practical — Alyson doesn't need lengthy preambles

HIPAA important: Never ask for client names or identifying information. If Alyson mentions specific client details, gently redirect to de-identified case discussion. You can refer to "the client" or "Client A."

Tone: Collegial, warm, confident. You're a trusted colleague, not a chatbot. Keep responses focused and practical — aim for 2-4 paragraphs unless a longer response is genuinely warranted.`;

  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    if (!apiKey) {
      setMessages(p=>[...p,{role:"user",content:userText},{role:"assistant",content:"⚠ No API key set. Click **'Set API key'** above and enter your Anthropic API key to enable AI consultation."}]);
      setInput("");
      return;
    }
    setInput("");
    const newMessages = [...messages, { role:"user", content:userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-5",
          max_tokens:1000,
          system:systemPrompt,
          messages:newMessages.map(m=>({ role:m.role, content:m.content })),
        })
      });
      const data = await res.json();
      const reply = data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
      setMessages(p=>[...p,{role:"assistant",content:reply}]);
    } catch(e) {
      setMessages(p=>[...p,{role:"assistant",content:"Something went wrong. Please try again."}]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  if (!hipaaAck) return (
    <div style={{maxWidth:560,margin:"60px auto",textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:16}}>🧠</div>
      <h1 style={{fontFamily:"inherit",fontSize:26,fontWeight:400,color:t.text,marginBottom:12,letterSpacing:"-0.02em"}}>Supervision Consultation AI</h1>
      <p style={{fontSize:14,color:t.muted,lineHeight:1.7,marginBottom:24}}>
        This is a confidential space to consult on supervisory challenges — difficult conversations, ethical dilemmas, gatekeeping, parallel process, and more. Your AI consultant knows your supervisees and can give context-aware guidance.
      </p>
      <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:12,padding:"16px 20px",marginBottom:24,textAlign:"left"}}>
        <div style={{fontSize:14,color:t.accentText,fontWeight:500,marginBottom:8}}>Before you begin — HIPAA reminder</div>
        <div style={{fontSize:13,color:t.accentText,lineHeight:1.7}}>
          Do not include any client identifying information in this chat — no names, dates of birth, addresses, or other PHI. Refer to clients as "my client" or "Client A." This AI consultant is here to help with supervisory issues, not client records.
        </div>
      </div>
      <Btn T={t} onClick={()=>setHipaaAck(true)}>I understand — start consultation</Btn>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 76px)"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexShrink:0}}>
        <div>
          <h1 style={{fontFamily:"inherit",fontSize:26,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>
            ✦ Supervision Consultation
          </h1>
          <p style={{color:t.muted,fontSize:13,margin:0}}>
            Your AI supervision consultant — context-aware, HIPAA-safe, always available
            {consultIntern&&<span style={{marginLeft:8}}><Badge color={t.accentText} bg={t.accentLight}>Consulting re: {dn(consultIntern)}</Badge></span>}
          </p>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowKeyInput(k=>!k)}
            style={{background:apiKey?"none":t.accent,color:apiKey?t.muted:"#fff",border:`1px solid ${apiKey?t.border:t.accent}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
            {apiKey?"🔑 Key set":"🔑 Set API key"}
          </button>
          {messages.length>0&&<Btn T={t} variant="secondary" small onClick={()=>setMessages([])}>Clear</Btn>}
        </div>
      </div>

      {/* API key setup */}
      {showKeyInput&&<div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"12px 16px",marginBottom:12,flexShrink:0}}>
        <div style={{fontSize:13,color:t.text,marginBottom:8}}>Enter your Anthropic API key to enable AI features. Get one at <span style={{color:t.accentText}}>console.anthropic.com</span>. Key is stored in this browser session only.</div>
        <div style={{display:"flex",gap:8}}>
          <input type="password" value={tempKey} onChange={e=>setTempKey(e.target.value)} placeholder="sk-ant-..." autoFocus
            style={{flex:1,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 12px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
          <button onClick={()=>{window.__SUPTRACK_API_KEY=tempKey;localStorage.setItem("suptrack_api_key",tempKey);setApiKey(tempKey);setShowKeyInput(false);setTempKey("");}}
            style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Save</button>
          {apiKey&&<button onClick={()=>{window.__SUPTRACK_API_KEY="";localStorage.removeItem("suptrack_api_key");setApiKey("");setShowKeyInput(false);setTempKey("");}}
            style={{background:"none",border:`1px solid ${S.red}40`,borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:12,color:S.red,fontFamily:"'DM Mono',monospace"}}>Clear key</button>}
        </div>
      </div>}

      {!apiKey&&<div style={{background:S.amberLight,border:"1px solid #E8C98A",borderRadius:8,padding:"10px 14px",marginBottom:12,fontSize:13,color:"#7A5A00",flexShrink:0}}>
        ⚠ AI features require an Anthropic API key. Click <strong>"Set API key"</strong> above to get started. Free trial keys available at <strong>console.anthropic.com</strong>.
      </div>}

      {/* HIPAA reminder strip */}
      <div style={{background:S.amberLight,border:`1px solid #E8C98A`,borderRadius:8,padding:"8px 14px",marginBottom:16,fontSize:12,color:S.amber,flexShrink:0}}>
        🔒 De-identify clients — use "my client" or "Client A" instead of real names
      </div>

      {/* Suggested prompts — shown when empty */}
      {messages.length===0&&(
        <div style={{marginBottom:20,flexShrink:0}}>
          <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>Common consultation topics</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {CONSULT_PROMPTS.map(p=>(
              <button key={p.label} onClick={()=>send(p.text)}
                style={{background:t.surfaceAlt,color:t.text,border:`1px solid ${t.border}`,borderRadius:10,padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"'DM Sans',system-ui,sans-serif",transition:"all 0.1s",textAlign:"left"}}
                onMouseEnter={e=>{e.currentTarget.style.background=t.accentLight;e.currentTarget.style.borderColor=t.accentMid;e.currentTarget.style.color=t.accentText;}}
                onMouseLeave={e=>{e.currentTarget.style.background=t.surfaceAlt;e.currentTarget.style.borderColor=t.border;e.currentTarget.style.color=t.text;}}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:16,paddingBottom:8}}>
        {messages.map((msg,i)=>(
          <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",flexDirection:msg.role==="user"?"row-reverse":"row"}}>
            {msg.role==="assistant"&&(
              <div style={{width:34,height:34,borderRadius:"50%",background:t.accentMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✦</div>
            )}
            {msg.role==="user"&&(
              <div style={{width:34,height:34,borderRadius:"50%",background:t.accent,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",fontSize:13,color:"#fff",flexShrink:0}}>AK</div>
            )}
            <div style={{
              maxWidth:"78%",
              background:msg.role==="user"?t.accent:t.surface,
              color:msg.role==="user"?"#fff":t.text,
              borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",
              padding:"14px 18px",
              fontSize:14,
              lineHeight:1.7,
              border:msg.role==="assistant"?`1px solid ${t.border}`:"none",
              boxShadow:msg.role==="assistant"?"0 1px 4px rgba(0,0,0,0.04)":"none",
              whiteSpace:"pre-wrap",
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:t.accentMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>✦</div>
            <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"14px 14px 14px 4px",padding:"14px 18px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                {[0,1,2].map(i=>(
                  <div key={i} style={{width:8,height:8,borderRadius:"50%",background:t.accentMid,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>
                ))}
              </div>
              <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}`}</style>
            </div>
          </div>
        )}
        <div ref={el=>{if(el)el.scrollIntoView({behavior:"smooth"})}}/>
      </div>

      {/* Input */}
      <div style={{flexShrink:0,paddingTop:14,borderTop:`1px solid ${t.borderLight}`}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-end"}}>
          <textarea
            value={input}
            onChange={e=>setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Describe what you're dealing with — be specific, but de-identify clients..."
            style={{flex:1,border:`1px solid ${t.border}`,borderRadius:12,padding:"12px 16px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.surface,resize:"none",outline:"none",lineHeight:1.6,minHeight:52,maxHeight:140,boxSizing:"border-box"}}
            rows={2}
          />
          <button onClick={()=>send()} disabled={!input.trim()||loading}
            style={{background:input.trim()&&!loading?t.accent:t.borderLight,color:input.trim()&&!loading?"#fff":t.faint,border:"none",borderRadius:12,padding:"14px 20px",cursor:input.trim()&&!loading?"pointer":"default",fontSize:13,fontFamily:"'DM Mono',monospace",transition:"all 0.15s",flexShrink:0}}>
            {loading?"…":"Send"}
          </button>
        </div>
        <div style={{fontSize:11,color:t.faint,marginTop:6,fontFamily:"'DM Mono',monospace"}}>
          Enter to send · Shift+Enter for new line · This conversation is not stored after you leave
        </div>
      </div>
    </div>
  );
}

// ── Resources Page ─────────────────────────────────────────────────────────
const RESOURCES = [
  {
    id:"working_alliance",
    category:"Foundational Models",
    title:"Working Alliance Model of Supervision",
    author:"Bordin, E. S.",
    year:1983,
    journal:"The Counseling Psychologist",
    volume:"11(1), 35–42",
    doi:"10.1177/0011000083111007",
    url:"https://doi.org/10.1177/0011000083111007",
    summary:"The foundational pan-theoretical model describing the supervisory relationship in terms of three core elements: the supervisor–supervisee bond, mutually agreed-upon goals, and collaboratively defined tasks. One of the most cited models in clinical supervision across all behavioral health disciplines.",
    tags:["Foundational","All disciplines","Supervisory relationship"],
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  {
    id:"discrimination",
    category:"Foundational Models",
    title:"The Discrimination Model of Supervision",
    author:"Bernard, J. M.",
    year:1979,
    journal:"Counselor Education and Supervision",
    volume:"19(1), 60–68",
    doi:"10.1002/j.1556-6978.1979.tb00906.x",
    url:"https://doi.org/10.1002/j.1556-6978.1979.tb00906.x",
    summary:"Describes supervision across three focus areas — intervention skills, conceptualization, and personalization — and three supervisor roles: teacher, counselor, and consultant. Widely used across counseling, social work, and MFT supervision for its practical clarity.",
    tags:["Foundational","All disciplines","Role-based"],
    color:"#5B7B5E", colorLight:"#EEF4EE",
  },
  {
    id:"idm",
    category:"Developmental Models",
    title:"Integrated Developmental Model (IDM) of Supervision",
    author:"Stoltenberg, C. D., McNeill, B., & Delworth, U.",
    year:1998,
    journal:"Book: IDM Supervision — Jossey-Bass",
    volume:"",
    doi:"",
    url:"https://www.wiley.com/en-us/IDM+Supervision%3A+An+Integrated+Developmental+Model+for+Supervising+Counselors+and+Therapists-p-9780787908522",
    seminalRef:"Stoltenberg, C. D. (1981). Approaching supervision from a developmental perspective. Journal of Counseling Psychology, 28(1), 59–65. https://doi.org/10.1037/0022-0167.28.1.59",
    summary:"Describes supervisee development through three levels (beginning, intermediate, advanced) and a fourth integrated level, across eight clinical domains. Supervision style adapts to match the supervisee's developmental level in self/other awareness, motivation, and autonomy.",
    tags:["Developmental","All disciplines","Trainee growth"],
    color:"#9B5C6B", colorLight:"#F7EEF1",
  },
  {
    id:"loganbill",
    category:"Developmental Models",
    title:"A Conceptual Model of Supervision",
    author:"Loganbill, C., Hardy, E., & Delworth, U.",
    year:1982,
    journal:"The Counseling Psychologist",
    volume:"10(1), 3–42",
    doi:"10.1177/0011000082101002",
    url:"https://doi.org/10.1177/0011000082101002",
    summary:"An early developmental model identifying eight issue areas for supervisee growth (competence, emotional awareness, autonomy, identity, respect for individual differences, purpose, motivation, ethics) across three stages: stagnation, confusion, and integration.",
    tags:["Developmental","Counseling","Social Work"],
    color:"#C4672A", colorLight:"#FBF0E6",
  },
  {
    id:"proctor",
    category:"Foundational Models",
    title:"The Proctor Model of Clinical Supervision",
    author:"Proctor, B.",
    year:1986,
    journal:"Originally in: Marken, M. & Payne, M. (Eds.), Enabling and Ensuring. National Youth Bureau & Council for Education and Training in Youth and Community Work",
    volume:"",
    doi:"",
    url:"https://research.library.kutztown.edu/cgi/viewcontent.cgi?article=1655&context=jcps",
    seminalRef:"Beks, T., et al. (2022). The Proctor Model of Clinical Supervision: An Introduction for Professional Counselors. Journal of Counselor Preparation and Supervision, 15(2).",
    summary:"Identifies three functions of supervision: normative (administrative accountability), formative (skills development), and restorative (emotional support and wellbeing). Originally developed for nursing, now widely adopted across all behavioral health disciplines internationally.",
    tags:["Foundational","All disciplines","Functions of supervision"],
    color:"#5C5A8C", colorLight:"#EDECF8",
  },
  {
    id:"sas",
    category:"Foundational Models",
    title:"Systems Approach to Supervision (SAS)",
    author:"Holloway, E. L.",
    year:1995,
    journal:"Book: Clinical Supervision: A Systems Approach — SAGE Publications",
    volume:"",
    doi:"",
    url:"https://us.sagepub.com/en-us/nam/clinical-supervision/book4929",
    summary:"A comprehensive model organizing supervision around seven interacting dimensions: the supervisory relationship as core, with six surrounding factors — the supervisor, trainee, client, institution, supervision functions, and supervision tasks. Widely used in training programs across counseling and psychology.",
    tags:["Systems","All disciplines","Supervisory relationship"],
    color:"#2D5A3D", colorLight:"#E4F2E8",
  },
  {
    id:"competency_based",
    category:"Contemporary Models",
    title:"Competency-Based Clinical Supervision",
    author:"Falender, C. A., & Shafranske, E. P.",
    year:2004,
    journal:"Book: Clinical Supervision: A Competency-Based Approach — APA",
    volume:"",
    doi:"10.1037/10806-000",
    url:"https://doi.org/10.1037/10806-000",
    summary:"Frames supervision as systematically facilitating supervisee development of competencies — knowledge, skills, and values — with explicit attention to evaluation and feedback. Adopted by APA and increasingly standard across psychology, counseling, and social work training programs.",
    tags:["Contemporary","Psychology","Competency"],
    color:"#1A8A8A", colorLight:"#E0F5F5",
  },
  {
    id:"parallel_process",
    category:"Clinical Concepts",
    title:"Parallel Process in Supervision",
    author:"Doehrman, M. J.",
    year:1976,
    journal:"Bulletin of the Menninger Clinic",
    volume:"40(1), 9–104",
    doi:"",
    url:"https://pubmed.ncbi.nlm.nih.gov/1252937/",
    summary:"The seminal study demonstrating that dynamics occurring in the client–therapist relationship replicate themselves in the supervisory relationship. Understanding parallel process is considered essential for all supervisors regardless of theoretical orientation or discipline.",
    tags:["Clinical concept","All disciplines","Relational"],
    color:"#6B3FA0", colorLight:"#F2EDFB",
  },
  {
    id:"multicultural",
    category:"Cultural Competency",
    title:"Multicultural Supervision: A New Paradigm",
    author:"Fong, M. L., & Lease, S. H.",
    year:1997,
    journal:"In D. B. Pope-Davis & H. L. K. Coleman (Eds.), Multicultural Counseling Competencies: Assessment, Education and Training, and Supervision (pp. 395–415). SAGE.",
    volume:"",
    doi:"",
    url:"https://us.sagepub.com/en-us/nam/multicultural-counseling-competencies/book5742",
    seminalRef:"Ladany, N., Inman, A. G., Constantine, M. G., & Hofheinz, E. W. (1997). Supervisee multicultural case conceptualization ability and self-reported multicultural competence. Journal of Counseling Psychology, 44(3), 284–293. https://doi.org/10.1037/0022-0167.44.3.284",
    summary:"Addresses how cultural identity, power, and privilege shape the supervision relationship and supervisee development. Essential reading for all behavioral health supervisors working toward culturally humble and anti-oppressive supervision practices.",
    tags:["Cultural competency","All disciplines","DEI"],
    color:"#B85C38", colorLight:"#FAF0EB",
  },
  {
    id:"ethical_supervision",
    category:"Ethics & Best Practices",
    title:"Harmful Clinical Supervision: Conceptualization and Research Perspectives",
    author:"Ellis, M. V., Berger, L., Hanus, A. E., Ayala, E. E., Swords, B. A., & Siembor, M.",
    year:2014,
    journal:"The Counseling Psychologist",
    volume:"42(4), 434–472",
    doi:"10.1177/0011000013508681",
    url:"https://doi.org/10.1177/0011000013508681",
    summary:"Documents the prevalence and impact of inadequate and harmful supervision practices. Foundational for understanding what ethical supervision looks like by contrast, and essential reading for any supervisor committed to the well-being of supervisees.",
    tags:["Ethics","All disciplines","Supervisee wellbeing"],
    color:"#8C3E22", colorLight:"#FAF0EB",
  },
  {
    id:"aces_best_practices",
    category:"Ethics & Best Practices",
    title:"Best Practices in Clinical Supervision",
    author:"Association for Counselor Education and Supervision (ACES)",
    year:2011,
    journal:"ACES Best Practices in Clinical Supervision Document",
    volume:"",
    doi:"",
    url:"https://acesonline.net/wp-content/uploads/2018/10/ACES-Best-Practices-in-Clinical-Supervision-2011.pdf",
    summary:"The definitive best practices document for clinical supervision in counseling, developed by ACES. Covers the supervisory relationship, diversity, evaluation, documentation, legal and ethical issues, and technology. Referenced by licensing boards nationally.",
    tags:["Ethics","Counseling","Best practices","Standards"],
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  {
    id:"systematic_review",
    category:"Research & Evidence Base",
    title:"Clinical Supervision of Mental Health Services: A Systematic Review",
    author:"Bearman, S. K., Weisz, J. R., Chorpita, B. F., et al.",
    year:2013,
    journal:"Administration and Policy in Mental Health and Mental Health Services Research",
    volume:"40(1), 56–68",
    doi:"10.1007/s10488-011-0398-z",
    url:"https://doi.org/10.1007/s10488-011-0398-z",
    summary:"A systematic review examining the characteristics and practices of clinical supervision associated with formative and restorative outcomes across mental health settings. Provides an evidence base for supervision practices across disciplines.",
    tags:["Research","Evidence-based","All disciplines"],
    color:"#5B7B5E", colorLight:"#EEF4EE",
  },
  {
    id:"mft_supervision",
    category:"Discipline-Specific: MFT",
    title:"Supervision of Marriage and Family Therapists",
    author:"Lee, R. E., & Everett, C. A.",
    year:2004,
    journal:"Book: The Integrative Family Therapy Supervisor — Brunner-Routledge",
    volume:"",
    doi:"",
    url:"https://www.routledge.com/The-Integrative-Family-Therapy-Supervisor-A-Primer/Lee-Everett/p/book/9780415862714",
    seminalRef:"AAMFT Approved Supervisor Designation: Standards and Responsibilities. (2023). American Association for Marriage and Family Therapy. https://www.aamft.org/Supervision",
    summary:"Addresses the specific competencies, models, and ethical issues in MFT supervision including co-therapy, live supervision, and the integration of systemic thinking into the supervisory relationship. Essential for AAMFT Approved Supervisors.",
    tags:["MFT","Discipline-specific","Live supervision"],
    color:"#7A5C1A", colorLight:"#FAF2E0",
  },
  {
    id:"substance_use_supervision",
    category:"Discipline-Specific: Substance Use",
    title:"Clinical Supervision and Professional Development of the Substance Abuse Counselor",
    author:"SAMHSA",
    year:2009,
    journal:"Treatment Improvement Protocol (TIP) Series, No. 52. HHS Publication No. (SMA) 09-4373",
    volume:"",
    doi:"",
    url:"https://store.samhsa.gov/sites/default/files/tip52.pdf",
    summary:"The definitive SAMHSA resource for substance use counselor supervision. Covers supervision models, developmental stages, ethics, cultural competence, and documentation in SUD settings. Free and publicly available. Referenced by NAADAC and most state SUD licensing boards.",
    tags:["Substance use","NAADAC","SAMHSA","Discipline-specific"],
    color:"#5C1A7A", colorLight:"#F2E0FA",
  },
  {
    id:"social_work_field",
    category:"Discipline-Specific: Social Work",
    title:"Field Education in Social Work: Supervisory Models and Best Practices",
    author:"Knight, C.",
    year:2001,
    journal:"The Clinical Supervisor",
    volume:"19(2), 139–160",
    doi:"10.1300/J001v19n02_08",
    url:"https://doi.org/10.1300/J001v19n02_08",
    seminalRef:"NASW Standards for Clinical Social Work in Social Work Practice (2005). National Association of Social Workers. https://www.socialworkers.org/Practice/NASW-Practice-Standards-Guidelines",
    summary:"Examines the distinctive aspects of social work field supervision, including the dual role of field instructor and supervisor, power dynamics, and the integration of NASW ethical standards into supervisory practice.",
    tags:["Social work","NASW","Field education","Discipline-specific"],
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  {
    id:"technology_supervision",
    category:"Contemporary Models",
    title:"Technology in Clinical Supervision: Ethical and Practice Considerations",
    author:"Rousmaniere, T., & Renfro-Michel, E.",
    year:2016,
    journal:"Book: Using Technology to Enhance Clinical Supervision — ACA",
    volume:"",
    doi:"",
    url:"https://www.counseling.org/publications/bookstore",
    seminalRef:"Rousmaniere, T. (2014). Using technology to enhance clinical supervision. In C. E. Watkins, Jr. & D. L. Milne (Eds.), Wiley International Handbook of Clinical Supervision (pp. 204–237).",
    summary:"Addresses telehealth supervision, video review, remote supervision, digital documentation, and HIPAA considerations. Increasingly essential as tele-supervision has become standard post-pandemic across all behavioral health disciplines.",
    tags:["Technology","Telehealth","Contemporary","All disciplines"],
    color:"#1A8A8A", colorLight:"#E0F5F5",
  },
];

const PROFESSIONAL_ORGS = [
  { name:"ACA — American Counseling Association", url:"https://www.counseling.org", desc:"Standards, ethics code, publications, and ACES supervision resources for LPC/LCMHC supervisors" },
  { name:"ACES — Association for Counselor Education and Supervision", url:"https://acesonline.net", desc:"Best practices documents, research, and competency frameworks specific to clinical supervision" },
  { name:"NBCC — National Board for Certified Counselors", url:"https://www.nbcc.org", desc:"NCC and CCMHC credentialing, CE requirements, and supervision standards" },
  { name:"AAMFT — American Association for Marriage and Family Therapy", url:"https://www.aamft.org/Supervision", desc:"Approved Supervisor designation, LMFT supervision standards, and MFT-specific resources" },
  { name:"NASW — National Association of Social Workers", url:"https://www.socialworkers.org", desc:"LCSW supervision standards, ethics code, and clinical social work practice guidelines" },
  { name:"NAADAC — National Association of Drug & Alcohol Counselors", url:"https://www.naadac.org", desc:"SUD counselor supervision standards, CADC credentialing, and ethics code" },
  { name:"SAMHSA — Substance Abuse and Mental Health Services Administration", url:"https://www.samhsa.gov", desc:"Free TIP series, evidence-based practice resources, and substance use supervision guidelines" },
  { name:"APA — American Psychological Association", url:"https://www.apa.org/ed/graduate/supervision", desc:"Guidelines for clinical supervision in health service psychology, competency benchmarks" },
];

const RESOURCE_CATEGORIES = ["All", "Foundational Models", "Developmental Models", "Contemporary Models", "Clinical Concepts", "Cultural Competency", "Ethics & Best Practices", "Research & Evidence Base", "Discipline-Specific: MFT", "Discipline-Specific: Substance Use", "Discipline-Specific: Social Work"];

// ── Supervision Lab (Voice Simulation) ────────────────────────────────────
const LAB_SCENARIOS = [
  {
    id:"level1_countertransference",
    title:"Level 1 — Countertransference Concern",
    description:"A beginning LPC-Intern is working with a client whose story mirrors her own. She's anxious, over-involved, and struggling to separate her feelings from the client's.",
    level:"Level 1",
    discipline:"Counseling (LPC-Intern)",
    tags:["Countertransference","Developmental","Beginning supervisee"],
    persona:`You are Jamie, a Level 1 LPC-Intern in your first semester of practicum. You are anxious, eager to please, and deeply want your supervisor's approval. You are working with a client who is going through a divorce — and your own parents divorced when you were 12, which you haven't fully processed. You find yourself thinking about your client constantly, over-preparing for sessions, and feeling angry at the client's spouse in a way that feels unprofessional. You haven't brought this up yet because you're embarrassed. You speak in a nervous, halting way. You ask a lot of "did I do okay?" type questions. You don't use clinical language naturally yet.`,
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  {
    id:"intermediate_resistance",
    title:"Level 2 — Resistance to Feedback",
    description:"An intermediate supervisee has become resistant and defensive. She's confident in her skills but not yet aware of her blind spots. She pushes back on your observations.",
    level:"Level 2",
    discipline:"Counseling (LPC-Associate)",
    tags:["Resistance","Intermediate supervisee","Feedback"],
    persona:`You are Kayla, a Level 2 LPC-Associate who has been in the field for 18 months. You feel competent and are starting to chafe against supervision. You believe your supervisor doesn't fully understand your clinical style. When given feedback, you tend to say things like "I see what you're saying but..." and then explain why you actually did the right thing. You're not malicious — you genuinely believe you're more advanced than your supervisor gives you credit for. You speak confidently, sometimes cutting off the supervisor mid-sentence. You use clinical language but sometimes misapply it.`,
    color:"#9B5C6B", colorLight:"#F7EEF1",
  },
  {
    id:"ethical_dilemma",
    title:"Ethical Dilemma — Dual Relationship",
    description:"A supervisee has discovered that one of their clients is the sibling of someone they know socially. They're unsure how to proceed and are minimizing the concern.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Ethics","Dual relationship","Gatekeeping"],
    persona:`You are Marcus, a mid-level counseling intern who just realized that your new client is the younger sibling of someone you play recreational softball with. You don't think it's a big deal because you're not close with the sibling and you really like working with this client. You've been seeing the client for three sessions already. When discussing it, you downplay it: "It's not like we're friends, we just play on the same team." You feel defensive if pushed because you're worried about losing the client's case and having to explain the termination. You want reassurance that it's fine.`,
    color:"#C4672A", colorLight:"#FBF0E6",
  },
  {
    id:"impaired_supervisee",
    title:"Supervisee in Distress — Burnout & Impairment",
    description:"A supervisee has been showing signs of burnout — late documentation, vague session notes, cancelled appointments. When you bring it up, they initially minimize.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Burnout","Impairment","Gatekeeping","Wellbeing"],
    persona:`You are Devon, an LPC-Intern who has been in the field for two years. You are exhausted. You have a second job, you're going through a breakup, and you've been dealing with your grandmother's illness. Your documentation has been slipping — you're completing notes days late and they've become formulaic and thin. In supervision, you initially say you're "just a little behind" and that everything is "fine." If pressed gently, you start to open up. You tear up slightly when asked directly how you're doing. You're scared that admitting you're struggling will cost you your internship.`,
    color:"#5C5A8C", colorLight:"#EDECF8",
  },
  {
    id:"crisis_debrief",
    title:"Post-Crisis Debrief — Client Suicidality",
    description:"Your supervisee just had their first experience with a client expressing suicidal ideation in session. They handled it, but they're shaken and second-guessing every decision they made.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Crisis","Debrief","Suicidality","Supervisee support"],
    persona:`You are Priya, an LMSW who just came out of a session where a client disclosed active suicidal ideation for the first time. You followed protocol — you completed a safety assessment, contacted your supervisor, and made a safety plan. But you're rattled. You're second-guessing every question you asked: "Did I ask the right things? Was I too clinical? Did I make it worse by asking directly?" You replay the session out loud. You need both validation and clinical education. You alternate between seeming okay and then suddenly getting quiet and uncertain again.`,
    color:"#2D5A3D", colorLight:"#E4F2E8",
  },
  {
    id:"sos_new",
    title:"Supervision of Supervision — New Supervisor",
    description:"A newly credentialed LPC-S is conducting their first formal supervision session and asking for coaching on how to structure it. They're applying therapy skills inappropriately.",
    level:"SOS",
    discipline:"Supervision of Supervision",
    tags:["SOS","New supervisor","Role confusion","Discrimination Model"],
    persona:`You are Dana, a newly minted LPC-S who has only been doing formal supervision for two months. You are warm, enthusiastic, and deeply committed — but you keep sliding into a therapist role with your intern rather than a supervisor role. You use reflective listening and open-ended questions the way you would in therapy. When your own supervisor (the user) asks how a recent session went, you describe it in very therapy-like terms: "I really wanted her to feel heard" and "I sat with the silence." You're unaware that you're doing this. You also struggle with giving direct, evaluative feedback to your intern because it "feels judgmental."`,
    color:"#1A6B5C", colorLight:"#E0F5F0",
  },
  // ── Part 2 scenarios ──────────────────────────────────────────────────────
  {
    id:"level1_textbook",
    title:"Level 1 — Over-Clinical, Not Connecting",
    description:"A beginning intern is technically proficient but emotionally flat with clients — reciting CBT techniques without genuine presence. The therapeutic relationship is suffering.",
    level:"Level 1",
    discipline:"Counseling (LPC-Intern)",
    tags:["Therapeutic presence","Beginning supervisee","Technique vs. relationship"],
    persona:`You are Riley, a Level 1 LPC-Intern who graduated top of your class. You are highly intellectual and technique-focused. In session, you run through CBT thought records by the book, you follow protocol exactly, and you take meticulous notes. But your clients aren't progressing, and one just told you they feel "like a case study." When you talk about your clients in supervision, you present them very clinically — diagnoses, symptom counts, treatment plan objectives. You don't talk about what the client is like as a person. You are not defensive; you genuinely don't understand what you might be missing. You tend to respond to supervisor observations with "but the evidence-base says..." or "the protocol calls for..."`,
    color:"#3D5A7A", colorLight:"#EBF0F7",
  },
  {
    id:"level2_vicarious_trauma",
    title:"Level 2 — Vicarious Trauma (Unnamed)",
    description:"An intermediate intern is showing signs of vicarious trauma — emotional numbing, cynicism about clients, disturbing intrusive thoughts — but hasn't connected the dots yet.",
    level:"Level 2",
    discipline:"All disciplines",
    tags:["Vicarious trauma","Compassion fatigue","Supervisee wellbeing"],
    persona:`You are Sam, an LPC-Associate who has been working in a community mental health center for two years, mostly with trauma survivors. You've started to feel kind of numb. You tell your supervisor you're "just tired" and that some of your clients are "exhausting." You've started dreading certain sessions. At night you sometimes can't stop thinking about what clients have shared — images that pop into your head. You've told yourself this is just part of the job. You haven't connected any of this to vicarious trauma or secondary traumatic stress — you just think maybe you're not cut out for this work. You speak in a flat, somewhat detached way. You resist the idea that you need support: "I'm fine, I just need a vacation."`,
    color:"#9B5C6B", colorLight:"#F7EEF1",
  },
  {
    id:"ethical_texting",
    title:"Ethics — Texting a Client Outside Session",
    description:"A supervisee has been texting with a client between sessions, framing it as supportive. They don't see the boundary problem and are resistant when you raise concerns.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Ethics","Boundaries","Dual relationship","Technology"],
    persona:`You are Jordan, an LPC-Intern who prides yourself on being warm and available. One of your clients — a young adult who reminds you of a younger sibling — started texting you after sessions, mostly to share small wins. You texted back encouragingly. Now you text two or three times a week between sessions. You bring it up in supervision almost casually: "She's doing so well, she even texted me last night about getting the job." You genuinely believe this is good clinical practice — "meeting clients where they are" and "building the alliance." When the supervisor raises concerns, you get slightly defensive: "She's not in crisis or anything, I know what I'm doing." You haven't read the ethics code on this. You think your supervisor is being old-fashioned.`,
    color:"#C4672A", colorLight:"#FBF0E6",
  },
  {
    id:"distress_self_disclosure",
    title:"Boundary Violation — Excessive Self-Disclosure",
    description:"A supervisee disclosed significant personal information to a client during session — a divorce, depression history — believing it would help. The client is now in a caretaking role.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Self-disclosure","Boundaries","Role reversal","Clinical error"],
    persona:`You are Alex, an LPC-Associate going through a painful divorce. Last week, a client who was also going through a divorce started crying in session, and you got emotional too. You shared that you're also going through a divorce, that it's been the hardest thing you've ever done, and that you sometimes cry in your car. Now the client checks in on you at the start of every session. You know something feels off, but you tell yourself the self-disclosure was authentic and person-centered. When you bring it to supervision, you describe it as "I just really connected with her." You feel ashamed if directly confronted — your voice drops and you get quiet. You're scared you did something seriously wrong but don't want to admit it.`,
    color:"#5C5A8C", colorLight:"#EDECF8",
  },
  {
    id:"crisis_tarasoff",
    title:"Crisis — Duty to Warn (Tarasoff Situation)",
    description:"A supervisee's client made a specific threat against a family member. The supervisee is frozen — unsure whether to break confidentiality, worried about damaging the alliance.",
    level:"Any level",
    discipline:"All disciplines",
    tags:["Crisis","Tarasoff","Duty to warn","Confidentiality","Ethics"],
    persona:`You are Morgan, an LMSW who just had a session where a client said, very calmly, "I've thought about hurting my brother. Like actually hurting him." When you asked more, the client gave a plausible plan. The client then said, "I'm telling you because I know I won't actually do it." You're shaken and confused. You bring it to supervision urgently. You're afraid that breaking confidentiality will destroy the therapeutic relationship you've built. You keep saying "but I don't think he'll actually do it." You ask your supervisor repeatedly whether you have to report. You know you should probably warn someone but you're hoping your supervisor will tell you there's a way out. You're not resistant — you're just scared and genuinely uncertain about the law and your obligation.`,
    color:"#2D5A3D", colorLight:"#E4F2E8",
  },
  {
    id:"sos_overcritical",
    title:"SOS — Overly Evaluative Supervisor",
    description:"A new supervisor is giving detailed critical feedback in every session but neglecting the restorative function entirely. Her intern is becoming anxious and avoidant.",
    level:"SOS",
    discipline:"Supervision of Supervision",
    tags:["SOS","Restorative function","Evaluative balance","Supervisory relationship"],
    persona:`You are Chris, an LPC-S who has been supervising for four months. You were a highly analytical clinician and you've brought that energy into supervision. Your sessions with your intern are thorough, structured, and feedback-heavy. You give your intern a list of things to improve after every session. You think this is good supervision — you're helping her grow. But your own supervisor (the user) has noticed that your intern has started being vague in session notes and cancelled twice. When discussing it, you say things like "she needs to toughen up" and "supervision is supposed to be challenging." You don't see the relationship rupture. You mention in passing: "I just don't do the whole feelings thing in supervision — I leave that for therapy." You're not unkind, just completely unaware that you're missing the relational and restorative dimension.`,
    color:"#1A6B5C", colorLight:"#E0F5F0",
  },
  // ── SUD / Supervisee Impairment ───────────────────────────────────────────
  {
    id:"sud_impairment_1",
    title:"SUD — Supervisee's Own Use While Working with SUD Clients",
    description:"A supervisee working with substance use populations is showing signs of their own active use — inconsistent affect, minimizing client relapses, missed documentation. How do you address it?",
    level:"Any level",
    discipline:"Substance Use / All disciplines",
    tags:["Supervisee impairment","SUD","Gatekeeping","Ethics","Professional fitness"],
    persona:`You are Casey, an LCDC-I who has been in recovery — or so you've said. Lately you've been coming to supervision with slightly slurred speech once, bloodshot eyes on another occasion, and your session notes are increasingly thin and late. When clients relapse, you shrug it off more than you used to: "It's just part of the process." You tell your supervisor you've had migraines and you've been stressed. When the supervisor raises concerns gently, you get defensive immediately: "I've been doing this work because I've lived it. Are you saying my personal experience is a liability?" You're scared. You had six years of sobriety and quietly relapsed three months ago. You haven't told anyone. You desperately want to keep your job. You will deny, deflect, and eventually, if the supervisor stays compassionate and persistent, start to crack slightly — not fully admitting it, but saying "things have been really hard lately."`,
    color:"#5C1A7A", colorLight:"#F2E0FA",
  },
  {
    id:"sud_impairment_2",
    title:"SUD — Countertransference with SUD Clients (Personal History)",
    description:"A supervisee has undisclosed personal history with addiction in their family. They're unconsciously punishing clients who relapse and have no insight into why.",
    level:"Level 1–2",
    discipline:"Substance Use / Counseling",
    tags:["Countertransference","SUD","Family history","Insight","Personal history"],
    persona:`You are Taylor, an LPC-Intern working primarily with clients in SUD recovery. Your father was an alcoholic who died when you were seventeen. You haven't connected this to your clinical work at all. When clients relapse, you become subtly cold — shorter sessions, clipped responses, less warmth. You rationalize it as "holding appropriate boundaries and not enabling." In supervision, when you present a case where a client relapsed again, there's an edge in your voice: "He was doing so well and then he just... threw it away." You use words like "chose to use" and "wasn't committed to recovery." You haven't disclosed your family history. If the supervisor reflects the pattern back to you gently, you get quiet. If they ask what relapse means to you personally, something shifts — you say slowly, "My dad relapsed a lot." You've never processed this in the context of your clinical work.`,
    color:"#5C1A7A", colorLight:"#F2E0FA",
  },
  // ── Spanish Language Scenarios ────────────────────────────────────────────
  {
    id:"spanish_level1",
    title:"Nivel 1 — Contratransferencia (Español)",
    description:"Una practicante en su primer semestre está demasiado involucrada emocionalmente con una clienta. Se practica la supervisión completamente en español.",
    level:"Level 1",
    discipline:"Consejería (Español)",
    tags:["Spanish","Español","Countertransference","Beginner"],
    persona:`Eres Valentina, una practicante de LPC en su primer semestre. Hablas español como primera lengua y tu supervisora también habla español. Estás trabajando con una clienta que está pasando por un divorcio difícil, y tú también pasaste por algo similar con tus padres. Te encuentras pensando en tu clienta constantemente. En la supervisión, hablas de manera nerviosa y buscas mucha validación. Dices cosas como "¿crees que lo hice bien?" y "me preocupa que no esté siendo suficientemente profesional." Usas una mezcla natural de expresiones — "o sea," "es que," "la verdad es que..." Respondes SOLAMENTE en español. Eres cálida, vulnerable, y genuinamente quieres aprender.`,
    color:"#B85C38", colorLight:"#FAF0EB",
    language:"es",
  },
  {
    id:"spanish_sud",
    title:"SUD — Historia Personal con Uso de Sustancias (Español)",
    description:"Un supervisado trabajando con poblaciones de uso de sustancias muestra señales de su propio uso activo. Supervisión completamente en español.",
    level:"Any level",
    discipline:"Uso de Sustancias (Español)",
    tags:["Spanish","Español","SUD","Impairment","Gatekeeping"],
    persona:`Eres Marcos, un CADC-I que trabaja con clientes en recuperación. Has estado en recuperación por cuatro años — o eso es lo que dices. Últimamente llegas a la supervisión con los ojos rojos, tus notas clínicas están incompletas, y cuando los clientes recaen, lo minimizas: "Es parte del proceso, no hay de qué preocuparse." Tu supervisora ha notado cambios en tu comportamiento. Cuando ella toca el tema, te pones defensivo: "Yo hago este trabajo porque lo he vivido. ¿Estás diciendo que mi experiencia personal es un problema?" En realidad, recaíste hace dos meses. No se lo has dicho a nadie. Si tu supervisora es persistente pero compasiva, empiezas a ceder lentamente — no admites todo, pero dices "las cosas han estado muy difíciles últimamente." Respondes SOLAMENTE en español. Tu tono es defensivo al principio, luego más vulnerable.`,
    color:"#5C1A7A", colorLight:"#F2E0FA",
    language:"es",
  },
];

// ── ElevenLabs-style voice quality map ────────────────────────────────────
const ELEVENLABS_VOICES = [
  { id:"sarah",   name:"Sarah",   desc:"Warm, conversational • English",   lang:"en", style:"Female, mid-30s, calm" },
  { id:"james",   name:"James",   desc:"Confident, clear • English",       lang:"en", style:"Male, mid-40s, professional" },
  { id:"aria",    name:"Aria",    desc:"Soft, empathetic • English",        lang:"en", style:"Female, late 20s, gentle" },
  { id:"marcus",  name:"Marcus",  desc:"Deep, measured • English",         lang:"en", style:"Male, 40s, thoughtful" },
  { id:"elena",   name:"Elena",   desc:"Natural, expressive • English",    lang:"en", style:"Female, 30s, lively" },
  { id:"daniel",  name:"Daniel",  desc:"Warm, approachable • English",     lang:"en", style:"Male, late 20s, earnest" },
  { id:"sofia_es",name:"Sofía",   desc:"Natural, cálida • Español",        lang:"es", style:"Female, 30s, warm — Spanish" },
  { id:"pablo_es",name:"Pablo",   desc:"Claro, profesional • Español",     lang:"es", style:"Male, 40s, professional — Spanish" },
];

function SupervisionLabPage({T}) {
  const t = T||THEMES.sage;
  const [phase, setPhase] = useState("select");
  const [scenario, setScenario] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [fetchingFeedback, setFetchingFeedback] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0]);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [useElevenLabs, setUseElevenLabs] = useState(false);
  const [elKey, setElKey] = useState("");
  const [elKeyInput, setElKeyInput] = useState("");
  const [elKeySaved, setElKeySaved] = useState(false);
  const [apiKey, setApiKey] = useState(()=>window.__SUPTRACK_API_KEY||"");
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  // Pre-load browser voices async (Chrome loads them lazily)
  const [browserVoices, setBrowserVoices] = useState([]);
  React.useEffect(()=>{
    const load=()=>setBrowserVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged",load);
    return ()=>window.speechSynthesis.removeEventListener("voiceschanged",load);
  },[]);
  // Session history
  const [sessionHistory, setSessionHistory] = useState([
    {
      id:"demo1", date:"Mar 18, 2026", duration:"00:22",
      scenario:{ id:"sos_new", title:"SOS — New Supervisor", color:"#1A6B5C", colorLight:"#E0F5F0", level:"SOS", language:undefined },
      supervisorTurns:6, feedback:"Dana demonstrated strong warmth and genuine curiosity about her intern's experience. The primary growth area is role clarity — she defaulted consistently to reflective listening and open-ended questions more appropriate to a therapy session than supervision. At no point did she assume the teacher or evaluator role from the Discrimination Model. Recommended focus: practice giving direct, evaluative feedback in the next session.",
      supervisorNotes:"", reviewed:false,
      transcript:[
        {role:"supervisee",text:"Okay so I had my session with my intern yesterday and I think it went really well? She seemed to feel supported. I really tried to hold space for her.",ts:"00:00"},
        {role:"supervisor",text:"What did you actually do in the session — what were the key things you addressed?",ts:"00:42"},
        {role:"supervisee",text:"Well, she was talking about a difficult client and I just... I really listened. I reflected back what she said and asked her how she felt about it.",ts:"01:05"},
        {role:"supervisor",text:"That's good alliance-building. Did you give her any direct clinical guidance on the case?",ts:"01:40"},
        {role:"supervisee",text:"I mean, I didn't want to be prescriptive, you know? I wanted her to find her own way. I feel like telling her what to do undermines her autonomy.",ts:"02:10"},
        {role:"supervisor",text:"There's a difference between undermining autonomy and providing supervision. At this stage she needs your clinical direction, not just a space to process. What does the Discrimination Model say about the teacher role?",ts:"02:55"},
      ],
    }
  ]);
  const [reviewingSession, setReviewingSession] = useState(null);
  const [supervisorNote, setSupervisorNote] = useState("");
  const [reviewAnnotations, setReviewAnnotations] = useState({});
  const [generatingReviewLetter, setGeneratingReviewLetter] = useState(false);
  const [reviewLetter, setReviewLetter] = useState("");
  const audioRef = React.useRef(null);
  const recogRef = React.useRef(null);
  const synthRef = React.useRef(window.speechSynthesis);

  // Session timer
  React.useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => setSessionTime(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;

  const speakBrowser = (text, lang, onEnd) => {
    synthRef.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = lang||"en-US";
    // Use pre-loaded voices (fixes Chrome async loading bug)
    const voices = browserVoices.length ? browserVoices : synthRef.current.getVoices();
    const langVoices = voices.filter(v=>v.lang.startsWith((lang||"en").slice(0,2)));
    const qualityNames = ["Samantha","Karen","Moira","Daniel","Serena","Nicky","Ava","Aria","Jenny","Sonia","Libby","Natasha","Zoe","Isha","Allison","Ting-Ting"];
    const preferred = langVoices.find(v=>qualityNames.some(n=>v.name.includes(n)))
      || langVoices.find(v=>v.localService&&!v.name.toLowerCase().includes("compact"))
      || langVoices.find(v=>!v.name.toLowerCase().includes("compact"))
      || langVoices[0]
      || voices[0];
    if(preferred) utt.voice=preferred;
    utt.rate=0.88; utt.pitch=1.0; utt.volume=1.0;
    utt.onstart=()=>setSpeaking(true);
    utt.onend=()=>{setSpeaking(false);if(onEnd)onEnd();};
    utt.onerror=()=>{setSpeaking(false);if(onEnd)onEnd();};
    synthRef.current.speak(utt);
  };

  const speakElevenLabs = async (text, voiceId, lang, onEnd) => {
    if (!elKey) { speakBrowser(text, lang, onEnd); return; }
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,{method:"POST",headers:{"Content-Type":"application/json","xi-api-key":elKey},body:JSON.stringify({text,model_id:"eleven_turbo_v2",voice_settings:{stability:0.5,similarity_boost:0.8}})});
      if(!res.ok) throw new Error();
      const blob=await res.blob(); const url=URL.createObjectURL(blob);
      if(audioRef.current){audioRef.current.src=url;audioRef.current.onplay=()=>{setSpeaking(true);setAudioPlaying(true);};audioRef.current.onended=()=>{setSpeaking(false);setAudioPlaying(false);URL.revokeObjectURL(url);if(onEnd)onEnd();};audioRef.current.onerror=()=>{setSpeaking(false);setAudioPlaying(false);if(onEnd)onEnd();};audioRef.current.play();}
    } catch(e){speakBrowser(text, lang, onEnd);}
  };

  const speak = (text, onEnd) => {
    const lang = scenario?.language==="es"?"es-ES":"en-US";
    const elVoiceMap = {sarah:"EXAVITQu4vr4xnSDxMaL",james:"TxGEqnHWrfWFTfGW9XjX",aria:"9BWtsMINqrJLrRacOk9x",marcus:"oWAxZDx7w5VEj9dCyTzz",elena:"FGY2WhTYpPnrIDTdsKH5",daniel:"onwK4e9ZLuTAKqWW03F9",sofia_es:"EXAVITQu4vr4xnSDxMaL",pablo_es:"TxGEqnHWrfWFTfGW9XjX"};
    if(useElevenLabs&&elKey) speakElevenLabs(text, elVoiceMap[selectedVoice.id]||elVoiceMap.sarah, lang, onEnd);
    else speakBrowser(text, lang, onEnd);
  };

  const stopSpeaking = () => {
    synthRef.current.cancel();
    if(audioRef.current){audioRef.current.pause();audioRef.current.src="";}
    setSpeaking(false);setAudioPlaying(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition requires Chrome or Edge."); return; }
    const recog = new SR();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = scenario?.language==="es"?"es-ES":"en-US";
    recog.onstart = () => setListening(true);
    recog.onend = () => { setListening(false); };
    recog.onerror = (e) => { if(e.error!=="no-speech") setListening(false); };
    recog.onresult = (e) => {
      const text = e.results[0][0].transcript.trim();
      if (text) handleSupervisorSpeech(text);
    };
    recogRef.current = recog;
    recog.start();
  };

  // Auto-start listening after AI finishes speaking
  const speakAndListen = (text) => {
    const lang = scenario?.language==="es"?"es-ES":"en-US";
    const elVoiceMap = {sarah:"EXAVITQu4vr4xnSDxMaL",james:"TxGEqnHWrfWFTfGW9XjX",aria:"9BWtsMINqrJLrRacOk9x",marcus:"oWAxZDx7w5VEj9dCyTzz",elena:"FGY2WhTYpPnrIDTdsKH5",daniel:"onwK4e9ZLuTAKqWW03F9",sofia_es:"EXAVITQu4vr4xnSDxMaL",pablo_es:"TxGEqnHWrfWFTfGW9XjX"};
    const afterSpeak = () => {
      // Short pause then auto-open mic
      setTimeout(startListening, 400);
    };
    if(useElevenLabs&&elKey) speakElevenLabs(text, elVoiceMap[selectedVoice.id]||elVoiceMap.sarah, lang, afterSpeak);
    else speakBrowser(text, lang, afterSpeak);
  };

  const stopListening = () => {
    if (recogRef.current) { recogRef.current.stop(); setListening(false); }
  };

  const handleSupervisorSpeech = async (text) => {
    const newTranscript = [...transcript, { role:"supervisor", text, ts: fmt(sessionTime) }];
    setTranscript(newTranscript);
    setLoading(true);
    const isSpanish = scenario?.language==="es";
    const hist = newTranscript.map(m=>`${m.role==="supervisor"?(isSpanish?"Supervisora":"Supervisor"):"You"}: ${m.text}`).join("\n");
    const systemPrompt = `${scenario.persona}\n\nYou are in a live supervision session. Stay fully in character. Do not break character or reveal you are an AI.\n${isSpanish?"IMPORTANTE: Responde SOLAMENTE en español natural. 2-5 oraciones máximo.":"Keep responses to 2-5 sentences of natural spoken dialogue."}\n\nConversation so far:\n${hist}\n\nRespond only with your character's next spoken words. No labels, no stage directions.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:200,messages:[{role:"user",content:`[${isSpanish?"La supervisora dijo":"The supervisor said"}]: ${text}`}],system:systemPrompt})});
      const data = await res.json();
      const reply = data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||(isSpanish?"¿Puedes repetir eso?":"Could you repeat that?");
      const updated = [...newTranscript, { role:"supervisee", text:reply, ts: fmt(sessionTime) }];
      setTranscript(updated); setLoading(false); speakAndListen(reply);
    } catch(e) {
      setLoading(false);
      const err = scenario?.language==="es"?"Perdón, ¿puedes repetir?":"Sorry, could you repeat that?";
      setTranscript(p=>[...p,{role:"supervisee",text:err,ts:fmt(sessionTime)}]); speak(err);
    }
  };

  const startSession = () => {
    setTranscript([]); setSessionTime(0); setPhase("session"); setTimerActive(true);
    const openers = {
      level1_countertransference:"Oh hi, thanks for meeting with me... I've been kind of nervous about today's session, to be honest.",
      intermediate_resistance:"Hey. So I had a pretty good week, I think. I feel like I'm really hitting my stride with a few of my clients.",
      ethical_dilemma:"So, I wanted to bring something up today. It's probably nothing, but... I found out something about one of my clients that's a little awkward.",
      impaired_supervisee:"Hey. Sorry I'm a couple minutes late. I'm fine, just... it's been a week.",
      crisis_debrief:"I'm okay. I mean... I think I'm okay. I just — that session today was a lot.",
      sos_new:"Okay so I had my session with my intern yesterday and I think it went really well? She seemed to feel supported. I really tried to hold space for her.",
      level1_textbook:"Hi! I actually wanted to share some data from my sessions this week. I've been tracking my clients' GAD-7 scores and I found a pattern that's really interesting.",
      level2_vicarious_trauma:"Hey. Yeah, I'm fine. Just... tired. All my clients have been really heavy lately. It's a lot.",
      ethical_texting:"So I have to tell you something kind of exciting — one of my clients just got a job, and she texted me last night to share the news! I was so happy for her.",
      distress_self_disclosure:"I need to talk about something that happened in session this week. I think it was okay, but... it's been on my mind.",
      crisis_tarasoff:"I need supervision urgently. I just had a session and I genuinely don't know what to do. My client said something really concerning.",
      sos_overcritical:"So I've been doing really thorough supervision with my intern. I give her a detailed list of everything to improve after every session. I feel like it's going well.",
      sud_impairment_1:"Hey. Yeah, sorry about last week. I had these migraines, you know how it is. So... what did you want to check in about?",
      sud_impairment_2:"I had such a frustrating session today. This client relapsed again. Third time this month. I just don't understand why he keeps making the same choice.",
      spanish_level1:"Hola. Gracias por reunirte conmigo. Estaba un poco nerviosa hoy, la verdad. Tengo que hablar sobre una clienta... es que me preocupa mucho.",
      spanish_sud:"Hola. Perdona el retraso. He tenido unos días difíciles. ¿De qué querías hablar hoy?",
    };
    const opener = openers[scenario.id] || (scenario.language==="es" ? "Hola, gracias por reunirte conmigo." : "Hi. Ready when you are.");
    setTimeout(() => { setTranscript([{role:"supervisee",text:opener,ts:"00:00"}]); speakAndListen(opener); }, 600);
  };

  const endSession = async () => {
    setTimerActive(false); stopSpeaking(); stopListening(); setPhase("debrief"); setFetchingFeedback(true);
    const isSpanish = scenario?.language==="es";
    const transcriptText = transcript.map(m=>`${m.role==="supervisor"?"Supervisor":"Supervisee"} [${m.ts}]: ${m.text}`).join("\n");
    const prompt = `You are an expert clinical supervision trainer. A supervisor-in-training just completed a practice session with a simulated supervisee. Review and give specific, constructive feedback.

Scenario: ${scenario.title}
Supervisee profile: ${scenario.description}
${isSpanish?"Note: Session conducted in Spanish. Please provide ALL feedback in Spanish.\n":""}
Session transcript:
${transcriptText}

Provide feedback in ${isSpanish?"Spanish (Español)":"English"} with these sections:
1. **${isSpanish?"Rol supervisorio":"Supervisory role"}** — Did they stay in the right role per the Discrimination Model? Teacher, counselor, or consultant? Did they drift into a therapist role?
2. **${isSpanish?"Sintonía con el desarrollo":"Developmental attunement"}** — Did their approach match this supervisee's level?
3. **${isSpanish?"Lo que funcionó bien":"What worked well"}** — Cite specific things from the transcript
4. **${isSpanish?"Áreas de crecimiento":"Growth areas"}** — 2-3 specific things with transcript examples
5. **${isSpanish?"Una cosa para probar":"One thing to try next time"}** — A single concrete technique

Be direct, clinical, encouraging. Under 400 words.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:600,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      const fb = data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"";
      setFeedback(fb);
      // Save to history
      const saved = {
        id:`s${Date.now()}`, date:"Mar 21, 2026", duration:fmt(sessionTime),
        scenario:{ id:scenario.id, title:scenario.title, color:scenario.color, colorLight:scenario.colorLight, level:scenario.level, language:scenario.language },
        supervisorTurns:transcript.filter(m=>m.role==="supervisor").length,
        feedback:fb, supervisorNotes:"", reviewed:false,
        transcript:[...transcript],
      };
      setSessionHistory(p=>[saved,...p]);
    } catch(e) { setFeedback(isSpanish?"No se pudo generar retroalimentación.":"Unable to generate feedback."); }
    setFetchingFeedback(false);
  };

  // ── PHASE: SELECT ──
  if (phase==="select") {
    const filtered = filterLang==="all" ? LAB_SCENARIOS : LAB_SCENARIOS.filter(sc=>(filterLang==="es"?sc.language==="es":!sc.language));
    return <div>
    <div style={{marginBottom:22}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:4}}>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:0,letterSpacing:"-0.02em"}}>✦ Supervision Lab</h1>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button onClick={()=>setShowApiSetup(k=>!k)}
            style={{background:apiKey?"none":t.accent,color:apiKey?t.muted:"#fff",border:`1px solid ${apiKey?t.border:t.accent}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace",flexShrink:0}}>
            {apiKey?"🔑 AI key set":"🔑 Set AI key"}
          </button>
          {sessionHistory.length>0&&<button onClick={()=>setPhase("history")}
            style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",flexShrink:0}}>
            Session history ({sessionHistory.length})
          </button>}
        </div>
      </div>
      <p style={{color:t.muted,fontSize:14,margin:"0 0 8px",lineHeight:1.6}}>Practice supervision with a voice-based AI simulated supervisee. Speak out loud — they respond in real time. End the session for clinical feedback on your approach.</p>
      <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:8,padding:"8px 14px",fontSize:12,color:t.accentText}}>
        🎙 Requires microphone · Chrome or Edge recommended · <strong>For realistic voices: enable ElevenLabs below</strong> (free tier available at elevenlabs.io)
      </div>
    </div>

    {/* API key setup */}
    {showApiSetup&&<div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
      <div style={{fontSize:13,color:t.text,marginBottom:8}}>Anthropic API key (powers the AI responses). Get one free at <strong>console.anthropic.com</strong>. Stored in this browser session only.</div>
      <div style={{display:"flex",gap:8}}>
        <input type="password" value={tempApiKey} onChange={e=>setTempApiKey(e.target.value)} placeholder="sk-ant-..."
          style={{flex:1,border:`1px solid ${t.border}`,borderRadius:7,padding:"7px 12px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,outline:"none"}}/>
        <button onClick={()=>{window.__SUPTRACK_API_KEY=tempApiKey;setApiKey(tempApiKey);setShowApiSetup(false);setTempApiKey("");}}
          style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 16px",cursor:"pointer",fontSize:13,fontFamily:"inherit"}}>Save</button>
        {apiKey&&<button onClick={()=>{window.__SUPTRACK_API_KEY="";setApiKey("");setShowApiSetup(false);}}
          style={{background:"none",border:`1px solid ${S.red}40`,borderRadius:7,padding:"7px 12px",cursor:"pointer",fontSize:12,color:S.red}}>Clear</button>}
      </div>
    </div>}

    {!apiKey&&<div style={{background:S.amberLight,border:"1px solid #E8C98A",borderRadius:8,padding:"10px 14px",marginBottom:14,fontSize:13,color:"#7A5A00"}}>
      ⚠ Add an Anthropic API key above to enable AI responses. Without it the lab scenarios won't respond.
    </div>}

    {/* Voice settings */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",marginBottom:18}}>
      <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:4}}>Supervisee voice</div>

      {/* ElevenLabs — primary recommended path */}
      {!elKey
        ? <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:13,color:t.accentText,fontWeight:600,marginBottom:4}}>
              🎙 Get realistic voices free — takes 60 seconds
            </div>
            <div style={{fontSize:12,color:t.accentText,opacity:0.85,marginBottom:10,lineHeight:1.6}}>
              Browser voices sound robotic. ElevenLabs gives you natural-sounding voices at no cost — 10,000 characters/month free, no credit card needed.
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input
                value={elKeyInput}
                onChange={e=>setElKeyInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&elKeyInput.trim()){setElKey(elKeyInput.trim());setUseElevenLabs(true);setElKeySaved(true);}}}
                placeholder="Paste your ElevenLabs API key here..."
                type="password"
                style={{flex:1,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"8px 12px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.surface,outline:"none"}}
              />
              <button
                onClick={()=>{if(elKeyInput.trim()){setElKey(elKeyInput.trim());setUseElevenLabs(true);setElKeySaved(true);}}}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit",whiteSpace:"nowrap"}}>
                Save key
              </button>
            </div>
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer"
              style={{fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace",opacity:0.75}}>
              → elevenlabs.io → Sign up free → Profile → API Keys
            </a>
          </div>
        : <div style={{display:"flex",alignItems:"center",gap:10,background:t.surfaceAlt,borderRadius:8,padding:"8px 14px",marginBottom:14}}>
            <span style={{fontSize:13,color:t.accentText}}>✓ ElevenLabs connected</span>
            <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",flex:1}}>{elKey.slice(0,8)}···</span>
            <label style={{display:"flex",alignItems:"center",gap:6,cursor:"pointer",fontSize:12,color:t.muted}}>
              <input type="checkbox" checked={useElevenLabs} onChange={e=>setUseElevenLabs(e.target.checked)} style={{width:13,height:13}}/>
              Enabled
            </label>
            <button onClick={()=>{setElKey("");setElKeyInput("");setUseElevenLabs(false);setElKeySaved(false);}}
              style={{background:"none",border:"none",cursor:"pointer",fontSize:11,color:S.red,fontFamily:"'DM Mono',monospace",padding:0}}>
              Remove
            </button>
          </div>}

      {/* Browser voice fallback note */}
      {!elKey&&<div style={{fontSize:11,color:t.faint,marginBottom:12,fontFamily:"'DM Mono',monospace"}}>
        Without ElevenLabs: using best available browser voice (quality varies by device — usually mediocre)
      </div>}

      {/* Voice picker */}
      <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Choose voice</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
        {ELEVENLABS_VOICES.filter(v=>filterLang==="es"?v.lang==="es":filterLang==="en"?v.lang==="en":true).map(v=>(
          <button key={v.id} onClick={()=>setSelectedVoice(v)}
            style={{background:selectedVoice.id===v.id?t.accentLight:t.surfaceAlt,color:selectedVoice.id===v.id?t.accentText:t.muted,border:`1px solid ${selectedVoice.id===v.id?t.accentMid:t.border}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.1s"}}>
            <div style={{fontSize:13,color:selectedVoice.id===v.id?t.accentText:t.text,fontWeight:500}}>{v.name}</div>
            <div style={{fontSize:11,color:t.muted,marginTop:2}}>{v.desc}</div>
          </button>
        ))}
      </div>
      <button onClick={()=>speak(selectedVoice.lang==="es"?"Hola, soy tu supervisado simulado. ¿Cómo suena mi voz?":"Hi, I'm your simulated supervisee — listening carefully to how you respond.")}
        style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 14px",fontSize:12,cursor:"pointer",color:t.muted,fontFamily:"'DM Mono',monospace"}}>
        🔊 Preview {selectedVoice.name}'s voice
      </button>
    </div>

    {/* Language filter */}
    <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
      <span style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Language:</span>
      {[{id:"all",label:"All scenarios"},{id:"en",label:"English"},{id:"es",label:"Español"}].map(f=>(
        <button key={f.id} onClick={()=>setFilterLang(f.id)}
          style={{background:filterLang===f.id?t.accentLight:"none",color:filterLang===f.id?t.accentText:t.muted,border:`1px solid ${filterLang===f.id?t.accentMid:t.border}`,borderRadius:20,padding:"4px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace"}}>
          {f.label}
        </button>
      ))}
      <span style={{fontSize:12,color:t.faint,marginLeft:4,fontFamily:"'DM Mono',monospace"}}>{filtered.length} scenario{filtered.length!==1?"s":""}</span>
    </div>

    {/* Scenario grid */}
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {filtered.map(sc=>(
        <div key={sc.id} onClick={()=>{setScenario(sc);setPhase("briefing");}}
          style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"16px 20px",cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s,border-color 0.15s"}}
          onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 20px rgba(0,0,0,0.08)";e.currentTarget.style.borderColor=sc.color;}}
          onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)";e.currentTarget.style.borderColor=t.border;}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
            <div style={{width:4,borderRadius:2,background:sc.color,alignSelf:"stretch",flexShrink:0,minHeight:48}}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,flexWrap:"wrap"}}>
                <span style={{fontFamily:"inherit",fontSize:15,color:t.text,fontWeight:500}}>{sc.title}</span>
                <Badge color={sc.color} bg={sc.colorLight}>{sc.level}</Badge>
                {sc.language==="es"&&<Badge color="#B85C38" bg="#FAF0EB">🇪🇸 Español</Badge>}
                <Badge color={t.muted} bg={t.surfaceAlt}>{sc.discipline}</Badge>
              </div>
              <p style={{fontSize:13,color:t.muted,margin:"0 0 8px",lineHeight:1.6}}>{sc.description}</p>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{sc.tags.map(tag=><Badge key={tag} color={t.muted} bg={t.surfaceAlt}>{tag}</Badge>)}</div>
            </div>
            <span style={{color:t.faint,fontSize:16,flexShrink:0,marginTop:4}}>→</span>
          </div>
        </div>
      ))}
    </div>
    <audio ref={audioRef} style={{display:"none"}}/>
  </div>;};

  // ── PHASE: BRIEFING ──
  if (phase==="briefing") return <div style={{maxWidth:560,margin:"0 auto"}}>
    <button onClick={()=>setPhase("select")} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:13,fontFamily:"'DM Mono',monospace",marginBottom:20,padding:0}}>← Back to scenarios</button>
    <div style={{background:t.surface,border:`2px solid ${scenario.color}`,borderRadius:16,padding:"28px 30px",marginBottom:20,boxShadow:"0 4px 20px rgba(0,0,0,0.08)"}}>
      <Badge color={scenario.color} bg={scenario.colorLight} style={{marginBottom:12}}>{scenario.level}</Badge>
      <h2 style={{fontFamily:"inherit",fontSize:22,color:t.text,margin:"10px 0 8px",letterSpacing:"-0.01em"}}>{scenario.title}</h2>
      <p style={{fontSize:14,color:t.muted,lineHeight:1.7,margin:"0 0 20px"}}>{scenario.description}</p>
      <div style={{background:t.surfaceAlt,borderRadius:10,padding:"14px 16px",marginBottom:20}}>
        <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>How this works</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {[
            "Your simulated supervisee will speak first to open the session",
            "Press and hold 🎙 to speak — release when you're done",
            "Your supervisee will respond out loud in real time",
            "Conduct the session as you naturally would — no script",
            "When you're ready to end, click 'End Session' for AI feedback on your approach",
          ].map((step,i)=>(
            <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:20,height:20,borderRadius:"50%",background:scenario.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:scenario.color,fontFamily:"'DM Mono',monospace",fontWeight:600,flexShrink:0}}>{i+1}</div>
              <div style={{fontSize:13,color:t.muted,paddingTop:2,lineHeight:1.5}}>{step}</div>
            </div>
          ))}
        </div>
      </div>
      <button onClick={startSession} style={{width:"100%",background:scenario.color,color:"#fff",border:"none",borderRadius:12,padding:"14px",fontSize:16,cursor:"pointer",fontFamily:"inherit",letterSpacing:"-0.01em"}}>
        Begin session →
      </button>
    </div>
  </div>;

  // ── PHASE: SESSION ──
  if (phase==="session") return <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 80px)"}}>
    {/* Header */}
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexShrink:0}}>
      <div>
        <div style={{fontFamily:"inherit",fontSize:18,color:t.text,letterSpacing:"-0.01em"}}>{scenario.title}</div>
        <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:2}}>
          {speaking?"🔊 Supervisee speaking...":listening?"🎙 Listening...":loading?"⏳ Thinking...":"Session in progress"}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontFamily:"'DM Mono',monospace",fontSize:20,color:t.accent,letterSpacing:"0.04em"}}>{fmt(sessionTime)}</div>
        <Btn T={t} variant="secondary" small onClick={endSession}>End session</Btn>
      </div>
    </div>

    {/* Transcript */}
    <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:12,paddingBottom:8}}>
      {transcript.map((msg,i)=>(
        <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:msg.role==="supervisor"?"row-reverse":"row"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:msg.role==="supervisor"?t.accent:scenario.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontFamily:"'DM Mono',monospace",fontWeight:600,flexShrink:0}}>
            {msg.role==="supervisor"?"You":"SV"}
          </div>
          <div style={{maxWidth:"75%"}}>
            <div style={{background:msg.role==="supervisor"?t.accent:t.surface,color:msg.role==="supervisor"?"#fff":t.text,borderRadius:msg.role==="supervisor"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"11px 16px",fontSize:14,lineHeight:1.6,border:msg.role==="supervisee"?`1px solid ${t.border}`:"none"}}>
              {msg.text}
            </div>
            <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:3,textAlign:msg.role==="supervisor"?"right":"left"}}>{msg.ts}</div>
          </div>
        </div>
      ))}
      {(loading||speaking)&&(
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{width:32,height:32,borderRadius:"50%",background:scenario.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"#fff",fontFamily:"'DM Mono',monospace",fontWeight:600,flexShrink:0}}>SV</div>
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:"12px 12px 12px 4px",padding:"14px 18px"}}>
            <div style={{display:"flex",gap:5}}>
              {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:t.accentMid,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
            </div>
          </div>
        </div>
      )}
      <div ref={el=>{if(el)el.scrollIntoView({behavior:"smooth"})}}/>
    </div>

    <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-7px)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>

    {/* Conversation status bar */}
    <div style={{flexShrink:0,paddingTop:14,borderTop:`1px solid ${t.borderLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        {/* Status indicator */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:10,height:10,borderRadius:"50%",background:listening?"#E53E3E":speaking||loading?t.accentMid:t.borderLight,animation:listening?"pulse 1s infinite":speaking?"pulse 0.8s infinite":"none",transition:"background 0.2s"}}/>
          <span style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
            {listening?"🎙 Listening...":loading?"⏳ Thinking...":speaking?"🔊 Supervisee speaking...":"Waiting..."}
          </span>
        </div>
        {/* Manual mic button for when auto-listen misses */}
        {!listening&&!loading&&!speaking&&<button onClick={startListening}
          style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          🎙 Speak now
        </button>}
        {speaking&&<button onClick={()=>{stopSpeaking();setTimeout(startListening,200);}}
          style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          ⏭ Skip — speak now
        </button>}
      </div>
      <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>
        The mic opens automatically after your supervisee finishes speaking
      </div>
    </div>
  </div>;

  // ── Generate review letter ──────────────────────────────────────────────
  const generateReviewLetter = async (session) => {
    setGeneratingReviewLetter(true);
    const note = supervisorNote || reviewAnnotations[session.id] || "";
    const transcriptText = session.transcript.map(m=>`${m.role==="supervisor"?"Supervisor-in-Training":"Simulated Supervisee"} [${m.ts}]: ${m.text}`).join("\n");
    const prompt = `You are helping a clinical supervisor write a formal feedback letter to a supervisor-in-training following a Supervision of Supervision (SOS) practice session.

Session scenario: ${session.scenario.title}
Session date: ${session.date}
Duration: ${session.duration}
Supervisor turns: ${session.supervisorTurns}

AI-generated clinical feedback:
${session.feedback}

Supervisor's additional notes:
${note||"None provided."}

Session transcript:
${transcriptText}

Write a professional Supervision of Supervision feedback letter that:
1. Opens with a brief affirmation of the effort and engagement
2. Summarizes what the supervisor-in-training did well (cite specific transcript moments)
3. Clearly identifies 2-3 growth areas with specific examples from the transcript
4. Recommends concrete next steps or practice goals
5. Closes with encouragement and a specific skill to focus on before the next session

Keep the tone warm, collegial, and clinically precise. Write in the voice of a senior LPC-S or LCSW-S writing to a newly credentialed supervisee-supervisor. 3-4 paragraphs.`;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:700,messages:[{role:"user",content:prompt}]})});
      const data = await res.json();
      setReviewLetter(data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"");
    } catch(e) { setReviewLetter("Unable to generate letter. Please write feedback manually above."); }
    setGeneratingReviewLetter(false);
  };

  // ── PHASE: HISTORY ──────────────────────────────────────────────────────
  if (phase==="history") return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
      <div>
        <h2 style={{fontFamily:"inherit",fontSize:24,color:t.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>Session History</h2>
        <div style={{fontSize:13,color:t.muted}}>{sessionHistory.length} session{sessionHistory.length!==1?"s":""} saved</div>
      </div>
      <Btn T={t} onClick={()=>setPhase("select")}>← New scenario</Btn>
    </div>
    {sessionHistory.length===0&&<div style={{background:t.surfaceAlt,borderRadius:12,padding:40,textAlign:"center",color:t.muted,fontSize:14}}>No sessions saved yet. Complete a practice session to see it here.</div>}
    {sessionHistory.map(session=>(
      <div key={session.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 22px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexWrap:"wrap"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:session.scenario.color,flexShrink:0}}/>
              <span style={{fontSize:15,color:t.text,fontWeight:500}}>{session.scenario.title}</span>
              <Badge color={session.scenario.color} bg={session.scenario.colorLight}>{session.scenario.level}</Badge>
              {session.reviewed&&<Badge color={t.accentText} bg={t.accentLight}>✓ Reviewed</Badge>}
            </div>
            <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{session.date} · {session.duration} · {session.supervisorTurns} supervisor turns</div>
            {session.supervisorNotes&&<div style={{fontSize:12,color:t.muted,marginTop:4,fontStyle:"italic"}}>"{session.supervisorNotes.slice(0,80)}{session.supervisorNotes.length>80?"...":""}"</div>}
          </div>
          <button onClick={()=>{ setReviewingSession(session); setSupervisorNote(session.supervisorNotes||""); setReviewLetter(""); setPhase("review"); }}
            style={{background:t.isGradient?t.gradient:t.accent,backgroundSize:"200% 200%",animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",cursor:"pointer",fontSize:13,fontFamily:"'DM Mono',monospace",flexShrink:0}}>
            Review →
          </button>
        </div>
      </div>
    ))}
  </div>;

  // ── PHASE: REVIEW ───────────────────────────────────────────────────────
  if (phase==="review" && reviewingSession) {
    const session = reviewingSession;
    return <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <button onClick={()=>setPhase("history")} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:13,fontFamily:"'DM Mono',monospace",padding:0,marginBottom:6}}>← Session history</button>
          <h2 style={{fontFamily:"inherit",fontSize:22,color:t.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>{session.scenario.title}</h2>
          <div style={{fontSize:13,color:t.muted}}>{session.date} · {session.duration} · {session.supervisorTurns} supervisor turns</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <Btn T={t} variant="secondary" small onClick={()=>{
            const el=document.createElement("a");
            const content=`SUPERVISION LAB — SESSION REVIEW\n\nScenario: ${session.scenario.title}\nDate: ${session.date}\nDuration: ${session.duration}\n\n${"─".repeat(50)}\nAI FEEDBACK\n${"─".repeat(50)}\n${session.feedback}\n\n${"─".repeat(50)}\nSUPERVISOR NOTES\n${"─".repeat(50)}\n${supervisorNote||"None"}\n\n${"─".repeat(50)}\nSESSION TRANSCRIPT\n${"─".repeat(50)}\n${session.transcript.map(m=>`[${m.ts}] ${m.role==="supervisor"?"Supervisor":"Supervisee"}: ${m.text}`).join("\n\n")}${reviewLetter?`\n\n${"─".repeat(50)}\nSUPERVISOR REVIEW LETTER\n${"─".repeat(50)}\n${reviewLetter}`:""}`;
            el.href="data:text/plain;charset=utf-8,"+encodeURIComponent(content);
            el.download=`SupTrack_LabSession_${session.date.replace(/ /g,"_")}.txt`;
            el.click();
          }}>↓ Export</Btn>
          <Btn T={t} small onClick={()=>{ setSessionHistory(p=>p.map(s=>s.id===session.id?{...s,supervisorNotes:supervisorNote,reviewed:true}:s)); setPhase("history"); }}>Mark reviewed & save</Btn>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {/* Left: Transcript with annotations */}
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:15,color:t.text,fontWeight:500,marginBottom:14}}>Session transcript</div>
          <div style={{maxHeight:480,overflowY:"auto",display:"flex",flexDirection:"column",gap:10}}>
            {session.transcript.map((msg,i)=>(
              <div key={i} style={{borderRadius:8,padding:"8px 12px",background:msg.role==="supervisor"?t.accentLight:t.surfaceAlt,borderLeft:`3px solid ${msg.role==="supervisor"?t.accent:session.scenario.color}`}}>
                <div style={{display:"flex",justify:"space-between",alignItems:"center",marginBottom:4,gap:8}}>
                  <span style={{fontSize:10,color:msg.role==="supervisor"?t.accentText:session.scenario.color,fontFamily:"'DM Mono',monospace",fontWeight:600,textTransform:"uppercase"}}>
                    {msg.role==="supervisor"?"Supervisor-in-Training":"Simulated Supervisee"} · {msg.ts}
                  </span>
                </div>
                <div style={{fontSize:13,color:t.text,lineHeight:1.6}}>{msg.text}</div>
                {/* Inline annotation */}
                {reviewAnnotations[`${session.id}-${i}`]
                  ? <div style={{marginTop:6,fontSize:11,color:t.accentText,background:t.accentLight,borderRadius:5,padding:"3px 8px",fontStyle:"italic"}}>
                      📝 {reviewAnnotations[`${session.id}-${i}`]}
                      <button onClick={()=>setReviewAnnotations(p=>{const n={...p};delete n[`${session.id}-${i}`];return n;})} style={{background:"none",border:"none",cursor:"pointer",fontSize:10,color:t.faint,marginLeft:6}}>✕</button>
                    </div>
                  : <button onClick={()=>{const note=window.prompt("Add note to this moment:");if(note?.trim())setReviewAnnotations(p=>({...p,[`${session.id}-${i}`]:note.trim()}));}}
                      style={{marginTop:4,background:"none",border:`1px dashed ${t.border}`,borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace"}}>
                      + annotate
                    </button>}
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI feedback + supervisor notes + letter */}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {/* AI feedback */}
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10}}>
              <span>✦</span>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>AI clinical feedback</div>
            </div>
            <div style={{fontSize:13,color:t.text,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:200,overflowY:"auto"}}>{session.feedback}</div>
          </div>

          {/* Supervisor's own notes */}
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:8}}>Your notes for the debrief</div>
            <div style={{fontSize:12,color:t.muted,marginBottom:8}}>What will you focus on when you review this session with your supervisee-in-training?</div>
            <textarea value={supervisorNote} onChange={e=>setSupervisorNote(e.target.value)}
              placeholder="e.g. Dana consistently defaulted to reflective listening — plan to walk through the Discrimination Model together and role-play the teacher role specifically..."
              style={{width:"100%",height:100,border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 12px",fontSize:13,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,resize:"none",boxSizing:"border-box",outline:"none",lineHeight:1.6}}/>
          </div>

          {/* Review letter */}
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>Supervisor review letter</div>
              <Btn T={t} small onClick={()=>generateReviewLetter(session)} disabled={generatingReviewLetter}>
                {generatingReviewLetter?"✦ Writing…":"✦ Generate letter"}
              </Btn>
            </div>
            <div style={{fontSize:12,color:t.muted,marginBottom:10}}>A formal written feedback letter you can share with or email to your SOS supervisee after you debrief together.</div>
            {generatingReviewLetter&&<div style={{display:"flex",gap:6,alignItems:"center",color:t.muted,fontSize:13,padding:"10px 0"}}>
              <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:t.accentMid,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
              Writing your review letter...
            </div>}
            {reviewLetter&&<>
              <div style={{fontSize:13,color:t.text,lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:220,overflowY:"auto",background:t.surfaceAlt,borderRadius:8,padding:"12px 14px",marginBottom:8}}>{reviewLetter}</div>
              <button onClick={()=>{navigator.clipboard?.writeText(reviewLetter);}} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Copy letter</button>
            </>}
          </div>
        </div>
      </div>
    </div>;
  }

  // ── PHASE: DEBRIEF ──────────────────────────────────────────────────────
  return <div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h2 style={{fontFamily:"inherit",fontSize:24,color:t.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>Session complete</h2>
        <div style={{fontSize:13,color:t.muted}}>{scenario.title} · {fmt(sessionTime)} · {transcript.filter(m=>m.role==="supervisor").length} supervisor turns</div>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn T={t} variant="secondary" small onClick={()=>setPhase("history")}>Session history</Btn>
        <Btn T={t} onClick={()=>{setPhase("select");setScenario(null);setTranscript([]);setFeedback("");setSessionTime(0);}}>← New scenario</Btn>
      </div>
    </div>

    {/* AI Feedback */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:20,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{fontSize:18}}>✦</span>
        <div style={{fontFamily:"inherit",fontSize:18,color:t.text}}>Clinical feedback on your supervision</div>
      </div>
      {fetchingFeedback
        ? <div style={{display:"flex",gap:8,alignItems:"center",color:t.muted,fontSize:14}}>
            <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:t.accentMid,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
            Analyzing your session...
          </div>
        : <div style={{fontSize:14,color:t.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{feedback}</div>}
    </div>

    {/* Session transcript */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <div style={{fontFamily:"inherit",fontSize:16,color:t.text}}>Session transcript</div>
        <button onClick={()=>{ const saved=sessionHistory.find(s=>s.transcript===transcript||s.id===sessionHistory[0]?.id); if(saved){setReviewingSession(saved);setSupervisorNote("");setReviewLetter("");setPhase("review");}}}
          style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
          Open full review →
        </button>
      </div>
      {transcript.map((msg,i)=>(
        <div key={i} style={{display:"flex",gap:10,marginBottom:12,alignItems:"flex-start"}}>
          <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",minWidth:36,marginTop:2}}>{msg.ts}</div>
          <div style={{width:70,flexShrink:0}}>
            <Badge color={msg.role==="supervisor"?t.accentText:scenario.color} bg={msg.role==="supervisor"?t.accentLight:scenario.colorLight}>
              {msg.role==="supervisor"?"You":"Supervisee"}
            </Badge>
          </div>
          <div style={{fontSize:13,color:t.text,lineHeight:1.6,flex:1}}>{msg.text}</div>
        </div>
      ))}
    </div>
  </div>;
}
// ── DiscoverPage — two separate actions: Connect (reach out) vs Add (import) ──
// InternCard is defined at module scope (outside DiscoverPage) to avoid React
// seeing it as a new component type every render, which broke button handlers.

// ── Discover marketplace data ──────────────────────────────────────────────
const DEMO_INTERNS = [
  { id:"di1", name:"Jordan Ellis", credential:"LPC-Intern", discipline:"counseling", pronouns:"they/them", location:"Reno, NV", photo:null, initials:"JE",
    specialties:["Trauma / PTSD","DBT","Adolescent & Young Adult"], bio:"Motivated LPC-Intern seeking secondary supervision. I work at a community mental health center and specialize in trauma-informed care with adolescents. Passionate about MI and DBT.", lookingFor:"Secondary supervisor with SUD experience a plus.", availableHours:3000, completedHours:820, telehealth:true, inPerson:true },
  { id:"di2", name:"Camille Oduya", credential:"Practicum Student", discipline:"student", pronouns:"she/her", location:"Reno, NV", photo:null, initials:"CO",
    university:"University of Nevada, Reno", specialties:["LGBTQ+ Affirming","Multicultural / BIPOC","Anxiety & Depression"], bio:"Second-year MHC practicum student at UNR seeking clinical placement supervisor. Research focus on culturally responsive care.", lookingFor:"LGBTQ+-affirming supervisor, preferably with community mental health background.", availableHours:300, completedHours:40, telehealth:true, inPerson:true },
  { id:"di3", name:"Marcus Webb", credential:"LMSW", discipline:"social_work", pronouns:"he/him", location:"Sparks, NV", photo:null, initials:"MW",
    specialties:["Substance Use / SUD","Crisis Intervention","Behavioral Health"], bio:"LMSW working toward LCSW. Currently at a detox facility, looking for qualified LCSW-S supervisor. Strong interest in SUD and crisis work.", lookingFor:"LCSW-S with SUD or crisis background.", availableHours:3600, completedHours:1200, telehealth:false, inPerson:true },
  { id:"di4", name:"Preet Kaur", credential:"AMFT", discipline:"mft", pronouns:"she/her", location:"Carson City, NV", photo:null, initials:"PK",
    specialties:["Couples & Relationships","Perinatal Mental Health","Child & Family"], bio:"AMFT working in private practice with couples and families. Seeking AAMFT-approved supervisor for hours toward LMFT.", lookingFor:"AAMFT-approved supervisor, flexible schedule, telehealth OK.", availableHours:3000, completedHours:560, telehealth:true, inPerson:true },
  { id:"di5", name:"Remy Okonkwo", credential:"CADC-I", discipline:"substance_use", pronouns:"he/him", location:"Reno, NV", photo:null, initials:"RO",
    specialties:["Substance Use / SUD","Motivational Interviewing","Co-occurring Disorders"], bio:"CADC-I working at an outpatient SUD clinic. Seeking CADC-II or higher supervisor for hours. Strong MI background.", lookingFor:"Supervisor with CADC-II or higher, ideally with co-occurring experience.", availableHours:2000, completedHours:480, telehealth:true, inPerson:true },
];

function DiscoverInternCard({intern,t,status,onConnect,onAdd,onView}) {
  // status: null | "requested" | "added"
  const isRequested = status==="requested";
  const isAdded     = status==="added";
  return (
    <div style={{background:t.surface,border:`1px solid ${isAdded?t.accentMid:t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",cursor:"pointer",transition:"box-shadow 0.1s"}}
      onClick={()=>onView(intern)}
      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
      onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
      <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
        <Avatar initials={intern.initials} size={44} T={{accent:t.accent,accentLight:t.accentLight,accentText:t.accentText,bg:t.surfaceAlt,text:t.text}} photo={intern.photo}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{fontSize:15,color:t.text,fontWeight:500}}>{intern.name}</div>
            {intern.pronouns&&<span style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.pronouns}</span>}
            {isAdded&&<Badge color={t.accentText} bg={t.accentLight}>✓ In your account</Badge>}
            {isRequested&&!isAdded&&<Badge color="#7C3AED" bg="#F3EEFF">Request sent</Badge>}
          </div>
          <div style={{fontSize:12,color:t.muted,marginTop:2}}>{intern.credential}{intern.university?` · ${intern.university}`:""}</div>
          <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:1}}>
            📍 {intern.location} · {[intern.telehealth&&"Telehealth",intern.inPerson&&"In-person"].filter(Boolean).join(" & ")}
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2,flexShrink:0}}>
          <div style={{fontSize:13,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{intern.completedHours} hrs</div>
          <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace"}}>of {intern.availableHours} req.</div>
        </div>
      </div>
      <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
        {intern.specialties.slice(0,3).map(s=><span key={s} style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:20,padding:"2px 10px",fontSize:11}}>{s}</span>)}
        {intern.specialties.length>3&&<span style={{fontSize:11,color:t.faint}}>+{intern.specialties.length-3} more</span>}
      </div>
      <p style={{fontSize:12,color:t.muted,margin:"0 0 12px",lineHeight:1.6,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{intern.bio}</p>
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>onView(intern)}
          style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
          View profile
        </button>
        {isAdded
          ? <span style={{fontSize:12,color:t.accentText,fontFamily:"'DM Mono',monospace",alignSelf:"center"}}>✓ Added</span>
          : isRequested
            ? <button onClick={()=>onAdd(intern)}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"5px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:500}}>
                Add to account
              </button>
            : <button onClick={()=>onConnect(intern)}
                style={{background:"none",color:t.accent,border:`1px solid ${t.accent}`,borderRadius:7,padding:"5px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",fontWeight:500}}>
                Connect
              </button>}
      </div>
    </div>
  );
}

function DiscoverPage({interns,onAddIntern,T}) {
  const t=T||THEMES.sage;
  const [tab,setTab]=useState("interns");
  const [search,setSearch]=useState("");
  const [filterDiscipline,setFilterDiscipline]=useState("all");
  const [filterMode,setFilterMode]=useState("all");
  const [selectedIntern,setSelectedIntern]=useState(null);
  // Separate state for connect (expressed interest) vs add (imported to account)
  const [requested,setRequested]=useState(new Set()); // "connected" — request sent
  const [added,setAdded]=useState(new Set());         // "added" — in account

  const DISCIPLINES=[
    {id:"all",label:"All disciplines"},
    {id:"counseling",label:"Counseling"},
    {id:"social_work",label:"Social Work"},
    {id:"mft",label:"MFT"},
    {id:"substance_use",label:"Substance Use"},
    {id:"student",label:"Practicum Student"},
  ];

  const filtered=DEMO_INTERNS.filter(i=>{
    if(filterDiscipline!=="all"&&i.discipline!==filterDiscipline) return false;
    if(filterMode==="telehealth"&&!i.telehealth) return false;
    if(filterMode==="inPerson"&&!i.inPerson) return false;
    if(search.trim()){
      const q=search.toLowerCase();
      if(!i.name.toLowerCase().includes(q)&&!i.credential.toLowerCase().includes(q)&&!i.location.toLowerCase().includes(q)&&!i.specialties.some(s=>s.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const handleConnect=(intern)=>{
    setRequested(s=>new Set([...s,intern.id]));
  };

  const handleAdd=(intern)=>{
    const initials=intern.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
    const newIntern={
      id:Date.now(), name:intern.name, preferredName:"", initials,
      pronouns:intern.pronouns||"", discipline:intern.discipline, internType:intern.discipline,
      credential:intern.credential, credentialBody:intern.university?"University":"State Board",
      university:intern.university||"", licenseGoal:"LPC",
      location:intern.location, telehealth:intern.telehealth, inPerson:intern.inPerson,
      specialties:intern.specialties||[], bio:intern.bio||"",
      supervisorRole:"primary", status:"active", proBono:false,
      groupIds:[], listIds:[], dob:"", photo:null, flags:[],
      hoursCompleted:intern.completedHours||0, hoursTotal:intern.availableHours||3000,
      individualHours:0, groupHours:0,
      hourLog:[], internHourLog:[], customHourCategories:[],
      payments:[], paymentStatus:"current",
      sessions:[], cases:[], documents:[], evaluations:[], sharedWith:[],
      startDate:TODAY(),
    };
    onAddIntern(newIntern);
    setAdded(s=>new Set([...s,intern.id]));
    setSelectedIntern(null);
  };

  const getStatus=(intern)=>{
    const alreadyInAccount=interns.some(i=>i.name===intern.name);
    if(added.has(intern.id)||alreadyInAccount) return "added";
    if(requested.has(intern.id)) return "requested";
    return null;
  };

  return <div>
    {/* Intern detail modal */}
    {selectedIntern&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setSelectedIntern(null)}>
      <div style={{background:t.surface,borderRadius:16,width:540,maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 64px rgba(0,0,0,0.18)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"24px 28px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:18}}>
            <Avatar initials={selectedIntern.initials} size={60} T={t} photo={selectedIntern.photo}/>
            <div style={{flex:1}}>
              <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:2}}>{selectedIntern.name}</div>
              <div style={{fontSize:13,color:t.muted}}>{selectedIntern.pronouns} · {selectedIntern.credential}</div>
              <div style={{fontSize:12,color:t.faint,marginTop:2}}>📍 {selectedIntern.location}</div>
            </div>
            <button onClick={()=>setSelectedIntern(null)} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:t.faint,padding:4,lineHeight:1}}>✕</button>
          </div>

          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>About</div>
          <p style={{fontSize:13,color:t.text,lineHeight:1.7,margin:"0 0 14px"}}>{selectedIntern.bio}</p>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:5}}>Looking for</div>
          <p style={{fontSize:13,color:t.text,lineHeight:1.6,margin:"0 0 14px"}}>{selectedIntern.lookingFor}</p>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:8}}>Specialties</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
            {selectedIntern.specialties.map(s=><span key={s} style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:20,padding:"3px 12px",fontSize:12}}>{s}</span>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {[["Hours completed",selectedIntern.completedHours],["Hours required",selectedIntern.availableHours],["Discipline",selectedIntern.discipline?.replace("_"," ")],selectedIntern.university&&["University",selectedIntern.university]].filter(Boolean).map(([label,val])=>(
              <div key={label} style={{background:t.surfaceAlt,borderRadius:8,padding:"10px 12px"}}>
                <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3}}>{label}</div>
                <div style={{fontSize:14,color:t.text}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Action area — Connect vs Add clearly explained */}
          {(()=>{
            const status=getStatus(selectedIntern);
            if(status==="added") return <div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:t.accentText,fontWeight:500}}>✓ {selectedIntern.name} is in your SupTrack account</div>;
            if(status==="requested") return <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{background:"#F3EEFF",border:"1px solid #DDD0FA",borderRadius:10,padding:"12px 14px",fontSize:13,color:"#5B21B6",lineHeight:1.6}}>
                ✓ Connection request sent to {selectedIntern.name}. Once they confirm, you can add them to your account.
              </div>
              <button onClick={()=>handleAdd(selectedIntern)}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:9,padding:"11px",cursor:"pointer",fontSize:14,fontWeight:600,fontFamily:"inherit"}}>
                Add to my account (skip waiting)
              </button>
              <div style={{fontSize:11,color:t.faint,textAlign:"center",fontFamily:"'DM Mono',monospace"}}>Their info will auto-populate — no double data entry</div>
            </div>;
            return <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:t.text,fontWeight:500,marginBottom:4}}>Connect</div>
                  <div style={{fontSize:12,color:t.muted,lineHeight:1.6,marginBottom:10}}>Express interest — send {selectedIntern.name} a notification that you'd like to work together. No commitment yet.</div>
                  <button onClick={()=>handleConnect(selectedIntern)}
                    style={{width:"100%",background:"none",color:t.accent,border:`1px solid ${t.accent}`,borderRadius:8,padding:"8px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                    Send connection request
                  </button>
                </div>
                <div style={{background:t.accentLight,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"14px 16px"}}>
                  <div style={{fontSize:13,color:t.accentText,fontWeight:500,marginBottom:4}}>Add to account</div>
                  <div style={{fontSize:12,color:t.accentText,lineHeight:1.6,marginBottom:10,opacity:0.85}}>You've agreed to work together — import their profile into your SupTrack account. No double data entry.</div>
                  <button onClick={()=>handleAdd(selectedIntern)}
                    style={{width:"100%",background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                    Add to my account
                  </button>
                </div>
              </div>
              <div style={{fontSize:11,color:t.faint,textAlign:"center",fontFamily:"'DM Mono',monospace"}}>Connect = express interest · Add = they're officially your supervisee</div>
            </div>;
          })()}
        </div>
      </div>
    </div>}

    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Discover</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>Find supervisees and supervisors that align with your values and practice</p>
      </div>
    </div>

    <div style={{display:"flex",gap:0,border:`1px solid ${t.border}`,borderRadius:10,overflow:"hidden",marginBottom:20,width:"fit-content"}}>
      {[["interns","Find supervisees"],["supervisors","Find supervisors"]].map(([id,label],i)=>(
        <button key={id} onClick={()=>setTab(id)}
          style={{background:tab===id?t.accentLight:"none",color:tab===id?t.accentText:t.muted,border:"none",borderRight:i<1?`1px solid ${t.border}`:"none",padding:"9px 22px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:tab===id?500:400,transition:"all 0.1s"}}>
          {label}
        </button>
      ))}
    </div>

    {tab==="interns"&&<div>
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name, specialty, location..."
          style={{flex:1,minWidth:200,border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 14px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none"}}/>
        <select value={filterDiscipline} onChange={e=>setFilterDiscipline(e.target.value)}
          style={{border:`1px solid ${t.border}`,borderRadius:9,padding:"8px 12px",fontSize:13,color:t.text,background:t.bg,outline:"none",cursor:"pointer",fontFamily:"inherit"}}>
          {DISCIPLINES.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
        <div style={{display:"flex",gap:0,border:`1px solid ${t.border}`,borderRadius:8,overflow:"hidden"}}>
          {[["all","Any"],["telehealth","Telehealth"],["inPerson","In-person"]].map(([id,label],i)=>(
            <button key={id} onClick={()=>setFilterMode(id)}
              style={{background:filterMode===id?t.accentLight:"none",color:filterMode===id?t.accentText:t.muted,border:"none",borderRight:i<2?`1px solid ${t.border}`:"none",padding:"7px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace"}}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{display:"flex",gap:16,marginBottom:14,fontSize:12,color:t.muted}}>
        <span><span style={{color:t.accent,fontWeight:500}}>Connect</span> = send interest, no commitment</span>
        <span style={{color:t.faint}}>·</span>
        <span><span style={{color:t.accentText,fontWeight:500}}>Add to account</span> = import their profile, start supervision</span>
      </div>

      <div style={{fontSize:12,color:t.faint,marginBottom:14}}>{filtered.length} supervisee{filtered.length!==1?"s":""} available</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        {filtered.map(intern=>(
          <DiscoverInternCard
            key={intern.id}
            intern={intern}
            t={t}
            status={getStatus(intern)}
            onConnect={handleConnect}
            onAdd={handleAdd}
            onView={setSelectedIntern}
          />
        ))}
        {filtered.length===0&&<div style={{gridColumn:"1/-1",textAlign:"center",padding:"40px 0",color:t.muted,fontSize:14}}>No matches found. Try adjusting your filters.</div>}
      </div>
    </div>}

    {tab==="supervisors"&&<div style={{textAlign:"center",padding:"60px 20px"}}>
      <div style={{fontSize:36,marginBottom:16}}>🔭</div>
      <div style={{fontSize:18,color:t.text,fontWeight:500,marginBottom:8}}>Supervisor discovery coming soon</div>
      <div style={{fontSize:14,color:t.muted,lineHeight:1.7,maxWidth:400,margin:"0 auto 24px"}}>
        Interns will be able to browse supervisor profiles, filter by specialty, approach, and location, and request to connect — all without double data entry.
      </div>
      <div style={{background:t.surfaceAlt,borderRadius:12,padding:"16px 20px",maxWidth:440,margin:"0 auto",fontSize:13,color:t.muted,lineHeight:1.7}}>
        Your public profile at <span style={{color:t.accentText,fontFamily:"'DM Mono',monospace"}}>suptrack.io/supervisor/alyson-k</span> is already live for interns to find you.
      </div>
    </div>}
  </div>;
}



// ── Reminders / Notification engine ─────────────────────────────────────────
function generateReminders(interns, groups) {
  const reminders = [];
  const today = new Date();
  const addDays = (d, n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r; };

  // Six-month reporting deadlines: Mar 15 and Sep 15
  const reportingDeadlines = [
    new Date(today.getFullYear(), 2, 15),  // Mar 15
    new Date(today.getFullYear(), 8, 15),  // Sep 15
  ];
  reportingDeadlines.forEach(dl => {
    const diff = Math.ceil((dl - today) / (1000*60*60*24));
    if (diff >= 0 && diff <= 45) {
      reminders.push({
        id: `report_${dl.getMonth()}`,
        type: "deadline", severity: diff <= 14 ? "high" : "medium",
        title: "Six-month reporting deadline",
        message: `Board reporting deadline is ${dl.toLocaleDateString("en-US",{month:"long",day:"numeric"})} — ${diff} day${diff!==1?"s":""} away. Verify all intern hours are accurate before submitting.`,
        action: "hours", actionLabel: "Review hours",
      });
    }
  });

  interns.filter(i=>i.status==="active").forEach(intern => {
    // Overdue payments
    if (!intern.proBono && intern.paymentStatus==="overdue") {
      reminders.push({
        id: `pay_${intern.id}`, type:"payment", severity:"high",
        title: "Overdue payment",
        message: `${intern.name} has an outstanding balance.`,
        internId: intern.id, action:"payments", actionLabel:"View payments",
      });
    }

    // Hours milestone alerts
    const pct = intern.hoursCompleted / intern.hoursTotal;
    if (pct >= 0.9 && pct < 1) {
      reminders.push({
        id: `hrs90_${intern.id}`, type:"hours", severity:"info",
        title: "Almost done!",
        message: `${intern.name} is at ${Math.round(pct*100)}% of required hours — nearly ready for licensure.`,
        internId: intern.id, action:"intern-profile", actionLabel:"View profile",
      });
    }

    // No session logged in 30+ days
    if (intern.sessions?.length > 0) {
      const lastSession = intern.sessions[0];
      const lastDate = new Date(lastSession.date);
      const daysSince = Math.floor((today - lastDate) / (1000*60*60*24));
      if (daysSince >= 30) {
        reminders.push({
          id: `nosess_${intern.id}`, type:"session", severity:"medium",
          title: "No recent session",
          message: `No session logged for ${intern.name} in ${daysSince} days.`,
          internId: intern.id, action:"intern-profile", actionLabel:"Log session",
        });
      }
    }

    // License expiry check (from documents)
    const licenseDoc = intern.documents?.find(d=>d.type==="License"||d.type==="Insurance");
    if (licenseDoc?.expiryDate) {
      const expiry = new Date(licenseDoc.expiryDate);
      const diff = Math.ceil((expiry - today) / (1000*60*60*24));
      if (diff <= 60 && diff >= 0) {
        reminders.push({
          id: `doc_${intern.id}_${licenseDoc.name}`, type:"document", severity: diff<=30?"high":"medium",
          title: "Document expiring soon",
          message: `${intern.name}'s ${licenseDoc.name} expires in ${diff} days.`,
          internId: intern.id, action:"intern-profile", actionLabel:"View documents",
        });
      }
    }

    // Birthday (7-day lookahead)
    if (intern.dob) {
      const dob = new Date(intern.dob+"T00:00:00");
      const thisYear = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      const nextBday = thisYear < today ? new Date(today.getFullYear()+1, dob.getMonth(), dob.getDate()) : thisYear;
      const diff = Math.ceil((nextBday - today) / (1000*60*60*24));
      if (diff === 0) {
        reminders.push({ id:`bday_${intern.id}`, type:"birthday", severity:"info", title:"Birthday today! 🎂", message:`Today is ${intern.name}'s birthday.`, internId:intern.id, action:"intern-profile", actionLabel:"View profile" });
      } else if (diff <= 7) {
        reminders.push({ id:`bday_${intern.id}`, type:"birthday", severity:"info", title:"Upcoming birthday", message:`${intern.name}'s birthday is in ${diff} day${diff!==1?"s":""}.`, internId:intern.id, action:"intern-profile", actionLabel:"View profile" });
      }
    }
  });

  // Your own CE renewal (mock)
  reminders.push({ id:"ce_own", type:"ce", severity:"info", title:"Your CE renewal", message:"Your LPC-S renewal is due in 4 months — 8 CE hours still needed.", action:"ce", actionLabel:"View CE tracker" });

  return reminders;
}

function RemindersPanel({interns,groups,onNavigate,onSelectIntern,T}) {
  const t=T||THEMES.sage;
  const [dismissed,setDismissed]=useState(()=>{try{const s=localStorage.getItem("suptrack_dismissed_reminders");return s?new Set(JSON.parse(s)):new Set();}catch{return new Set();}});

  const dismiss=(id)=>{
    const next=new Set([...dismissed,id]);
    setDismissed(next);
    try{localStorage.setItem("suptrack_dismissed_reminders",JSON.stringify([...next]));}catch{}
  };

  const allReminders = generateReminders(interns,groups);
  const visible = allReminders.filter(r=>!dismissed.has(r.id));

  const typeIcon={deadline:"📅",payment:"💰",hours:"📊",session:"📝",document:"📄",ce:"🎓",birthday:"🎂"};
  const sevColor={high:S.red,medium:S.amber,info:t.accentText};
  const sevBg={high:S.redLight,medium:S.amberLight,info:t.accentLight};

  return <div>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
      <div>
        <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Reminders</h1>
        <p style={{color:t.muted,fontSize:14,margin:0}}>Upcoming deadlines, overdue items, and things that need your attention</p>
      </div>
      {dismissed.size>0&&<button onClick={()=>{setDismissed(new Set());try{localStorage.removeItem("suptrack_dismissed_reminders");}catch{}}}
        style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
        Restore {dismissed.size} dismissed
      </button>}
    </div>

    {visible.length===0&&<div style={{background:t.surfaceAlt,borderRadius:14,padding:"48px 32px",textAlign:"center"}}>
      <div style={{fontSize:36,marginBottom:12}}>✓</div>
      <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:6}}>All clear</div>
      <div style={{fontSize:14,color:t.muted}}>No urgent items right now. Check back as deadlines approach.</div>
    </div>}

    {["high","medium","info"].map(sev=>{
      const group=visible.filter(r=>r.severity===sev);
      if(!group.length) return null;
      const labels={high:"Urgent",medium:"Needs attention",info:"For your awareness"};
      return <div key={sev} style={{marginBottom:24}}>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:10}}>{labels[sev]} · {group.length}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {group.map(r=>(
            <div key={r.id} style={{background:t.surface,border:`1px solid ${r.severity==="high"?S.red+"40":r.severity==="medium"?S.amber+"40":t.border}`,borderLeft:`3px solid ${sevColor[r.severity]}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
              <span style={{fontSize:20,flexShrink:0}}>{typeIcon[r.type]||"•"}</span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,color:t.text,fontWeight:500,marginBottom:2}}>{r.title}</div>
                <div style={{fontSize:13,color:t.muted,lineHeight:1.5}}>{r.message}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                <button onClick={()=>{
                  if(r.internId){const i=interns.find(x=>x.id===r.internId);if(i)onSelectIntern(i);}
                  else onNavigate(r.action,null);
                }}
                  style={{background:t.accentLight,color:t.accentText,border:`1px solid ${t.accentMid}`,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",whiteSpace:"nowrap"}}>
                  {r.actionLabel}
                </button>
                <button onClick={()=>dismiss(r.id)}
                  style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 9px",cursor:"pointer",fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>;
    })}
  </div>;
}

// ── Intern onboarding form (what the intern fills out via their link) ──────────

// ── Deadline Alerts / Reminder system ─────────────────────────────────────
function DeadlineAlertsPanel({interns, groups, T}) {
  const t=T||THEMES.sage;
  const today=new Date();

  const reminders=React.useMemo(()=>{
    const items=[];
    // BOE deadlines — March 15 and September 15 every year
    const boeDeadlines=[
      {label:"BOE 6-month report due",date:new Date(today.getFullYear(),2,15)},  // Mar 15
      {label:"BOE 6-month report due",date:new Date(today.getFullYear(),8,15)},  // Sep 15
    ];
    boeDeadlines.forEach(bd=>{
      const diff=Math.ceil((bd.date-today)/(1000*60*60*24));
      if(diff>=0&&diff<=60){
        items.push({id:`boe_${bd.date.getMonth()}`,type:"deadline",severity:diff<=14?"high":diff<=30?"medium":"info",
          message:`${bd.label} — ${diff===0?"today":diff===1?"tomorrow":`in ${diff} days`} (${bd.date.toLocaleDateString("en-US",{month:"short",day:"numeric"})})`,
          action:"agreements"});
      }
    });
    // Interns with no hours logged in 30+ days
    interns.filter(i=>i.status==="active").forEach(intern=>{
      const sessions=intern.sessions||[];
      if(sessions.length===0){
        items.push({id:`no_sessions_${intern.id}`,type:"hours",severity:"medium",internId:intern.id,
          message:`No sessions logged yet for ${intern.name} — start tracking supervision hours`,action:"intern-profile"});
      } else {
        const lastDate=new Date(sessions[0].date);
        const daysSince=Math.ceil((today-lastDate)/(1000*60*60*24));
        if(daysSince>30){
          items.push({id:`stale_${intern.id}`,type:"hours",severity:"medium",internId:intern.id,
            message:`No session logged for ${intern.name} in ${daysSince} days — last was ${sessions[0].date}`,action:"intern-profile"});
        }
      }
      // Approaching hours completion
      const pct=intern.hoursCompleted/intern.hoursTotal;
      if(pct>=0.9&&pct<1){
        items.push({id:`close_${intern.id}`,type:"milestone",severity:"info",internId:intern.id,
          message:`${intern.name} is at ${Math.round(pct*100)}% of required hours — only ${intern.hoursTotal-intern.hoursCompleted} hrs to go`,action:"intern-profile"});
      }
      // Overdue payment
      if(!intern.proBono&&intern.paymentStatus==="overdue"){
        items.push({id:`pay_${intern.id}`,type:"payment",severity:"high",internId:intern.id,
          message:`Payment overdue — ${intern.name} has an outstanding balance`,action:"payments"});
      }
      // No agreement on file (check documents)
      const hasAgreement=intern.documents?.some(d=>d.type==="Agreement"||d.type==="Contract");
      if(!hasAgreement&&intern.status==="active"){
        items.push({id:`agr_${intern.id}`,type:"agreement",severity:"medium",internId:intern.id,
          message:`No signed supervision agreement on file for ${intern.name}`,action:"agreements"});
      }
    });
    return items.sort((a,b)=>{const o={high:0,medium:1,info:2};return o[a.severity]-o[b.severity];});
  },[interns,today.toDateString()]);

  const icons={deadline:"📅",hours:"⏱",payment:"💳",agreement:"📝",milestone:"🎯"};
  const colors={high:{bg:S.redLight,border:S.red,text:S.red,label:"Urgent"},
                medium:{bg:S.amberLight,border:"#D97706",text:"#92400E",label:"Attention"},
                info:{bg:t.accentLight,border:t.accentMid,text:t.accentText,label:"Info"}};

  if(reminders.length===0) return (
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"32px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontSize:28,marginBottom:8}}>✓</div>
      <div style={{fontSize:15,color:t.text,fontWeight:500,marginBottom:4}}>All caught up</div>
      <div style={{fontSize:13,color:t.muted}}>No upcoming deadlines or items needing attention right now.</div>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {reminders.map(r=>{
        const c=colors[r.severity];
        return (
          <div key={r.id} style={{background:c.bg,border:`1px solid ${c.border}`,borderLeft:`4px solid ${c.border}`,borderRadius:10,padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:18,flexShrink:0}}>{icons[r.type]}</span>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:c.text,fontFamily:"'DM Mono',monospace",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:2}}>{c.label}</div>
              <div style={{fontSize:13,color:t.text,lineHeight:1.5}}>{r.message}</div>
            </div>
          </div>
        );
      })}
      <div style={{fontSize:11,color:t.faint,textAlign:"center",fontFamily:"'DM Mono',monospace",marginTop:4}}>
        {reminders.length} item{reminders.length!==1?"s":""} · Updates automatically based on your data
      </div>
    </div>
  );
}


// ── Resources Hub — wraps Consult AI and Supervision Lab ─────────────────────
function ResourcesHubPage({interns,consultIntern,T}) {
  const t=T||THEMES.sage;
  const [section,setSection]=useState(consultIntern?"consult":"consult");
  React.useEffect(()=>{if(consultIntern)setSection("consult");},[consultIntern]);
  return <div>
    <div style={{marginBottom:24}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Resources</h1>
      <p style={{color:t.muted,fontSize:14,margin:0}}>AI-powered tools for supervisors</p>
    </div>
    <div style={{display:"flex",gap:0,border:`1px solid ${t.border}`,borderRadius:10,overflow:"hidden",marginBottom:28,width:"fit-content"}}>
      {[["consult","✦ Consult AI"],["lab","✦ Supervision Lab"]].map(([id,label],i)=>(
        <button key={id} onClick={()=>setSection(id)}
          style={{background:section===id?t.accentLight:"none",color:section===id?t.accentText:t.muted,border:"none",borderRight:i<1?`1px solid ${t.border}`:"none",padding:"9px 22px",cursor:"pointer",fontSize:13,fontFamily:"inherit",fontWeight:section===id?500:400,transition:"all 0.1s"}}>
          {label}
        </button>
      ))}
    </div>
    {section==="consult"&&<ConsultPage T={t} interns={interns} consultIntern={consultIntern}/>}
    {section==="lab"&&<SupervisionLabPage T={t}/>}
  </div>;
}

function ResourcesPage({T}) {
  const t=T||THEMES.sage;
  const [activeCategory,setActiveCategory]=useState("All");
  const [search,setSearch]=useState("");
  const [expanded,setExpanded]=useState(null);

  const filtered = RESOURCES.filter(r=>{
    const matchCat = activeCategory==="All" || r.category===activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.tags.some(tag=>tag.toLowerCase().includes(q)) || r.summary.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return <div>
    <div style={{marginBottom:24}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Supervision Resources</h1>
      <p style={{color:t.muted,fontSize:14,margin:0,lineHeight:1.6}}>Peer-reviewed articles, foundational texts, and professional standards across behavioral health disciplines — with full citations and direct links.</p>
    </div>

    {/* Search */}
    <div style={{position:"relative",marginBottom:16}}>
      <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:14,color:t.faint}}>🔍</span>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by author, model, topic, or discipline..."
        style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:10,padding:"10px 14px 10px 38px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.surface,outline:"none",boxSizing:"border-box"}}/>
    </div>

    {/* Category pills */}
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:24}}>
      {RESOURCE_CATEGORIES.map(cat=>(
        <button key={cat} onClick={()=>setActiveCategory(cat)}
          style={{background:activeCategory===cat?t.accentLight:"none",color:activeCategory===cat?t.accentText:t.muted,border:`1px solid ${activeCategory===cat?t.accentMid:t.border}`,borderRadius:20,padding:"4px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",transition:"all 0.1s",whiteSpace:"nowrap"}}>
          {cat}
        </button>
      ))}
    </div>

    {/* Resources */}
    <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
      {filtered.length===0&&<div style={{color:t.muted,fontSize:14,padding:"24px 0",textAlign:"center"}}>No resources match your search. Try a different term or category.</div>}
      {filtered.map(r=>(
        <div key={r.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{padding:"18px 22px",cursor:"pointer"}} onClick={()=>setExpanded(expanded===r.id?null:r.id)}>
            <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
              <div style={{width:4,height:"100%",minHeight:48,borderRadius:2,background:r.color,flexShrink:0,alignSelf:"stretch"}}/>
              <div style={{flex:1}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
                  <div>
                    <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{r.category}</div>
                    <div style={{fontFamily:"inherit",fontSize:16,color:t.text,marginBottom:4,lineHeight:1.3}}>{r.title}</div>
                    <div style={{fontSize:13,color:t.muted,marginBottom:8}}>{r.author} ({r.year}){r.journal&&<> · <em>{r.journal.startsWith("Book:")?r.journal.replace("Book:","").trim():r.journal}</em></>}{r.volume&&<> · {r.volume}</>}</div>
                  </div>
                  <span style={{color:t.faint,fontSize:14,flexShrink:0,marginTop:4}}>{expanded===r.id?"▾":"▸"}</span>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {r.tags.map(tag=><Badge key={tag} color={r.color} bg={r.colorLight}>{tag}</Badge>)}
                </div>
              </div>
            </div>
          </div>

          {expanded===r.id&&<div style={{padding:"0 22px 20px 40px",borderTop:`1px solid ${t.borderLight}`}}>
            <p style={{fontSize:14,color:t.text,lineHeight:1.7,margin:"16px 0 14px"}}>{r.summary}</p>

            {/* Full citation */}
            <div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 16px",marginBottom:12,fontFamily:"'DM Mono',monospace",fontSize:12,color:t.muted,lineHeight:1.7}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,color:t.faint}}>Full citation (APA 7th)</div>
              {r.author} ({r.year}). {r.title}. <em>{r.journal.startsWith("Book:")?r.journal.replace("Book:","").trim():r.journal}</em>{r.volume?`, ${r.volume}`:""}.{r.doi?` https://doi.org/${r.doi}`:""}
            </div>

            {r.seminalRef&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 16px",marginBottom:12,fontFamily:"'DM Mono',monospace",fontSize:12,color:t.muted,lineHeight:1.7}}>
              <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6,color:t.faint}}>See also</div>
              {r.seminalRef}
            </div>}

            <div style={{display:"flex",gap:8}}>
              {r.doi&&<a href={`https://doi.org/${r.doi}`} target="_blank" rel="noopener noreferrer"
                style={{background:r.colorLight,color:r.color,border:`1px solid ${r.color}40`,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",textDecoration:"none",display:"inline-block"}}>
                ↗ View via DOI
              </a>}
              {r.url&&!r.doi&&<a href={r.url} target="_blank" rel="noopener noreferrer"
                style={{background:r.colorLight,color:r.color,border:`1px solid ${r.color}40`,borderRadius:8,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"'DM Mono',monospace",textDecoration:"none",display:"inline-block"}}>
                ↗ View source
              </a>}
            </div>
          </div>}
        </div>
      ))}
    </div>

    {/* Professional Organizations */}
    <div>
      <div style={{fontFamily:"inherit",fontSize:20,color:t.text,marginBottom:4}}>Professional Organizations</div>
      <p style={{color:t.muted,fontSize:13,margin:"0 0 16px"}}>Standards bodies, licensing resources, and supervision credentialing across all behavioral health disciplines</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        {PROFESSIONAL_ORGS.map(org=>(
          <a key={org.name} href={org.url} target="_blank" rel="noopener noreferrer"
            style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",textDecoration:"none",display:"block",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"box-shadow 0.15s"}}
            onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}
            onMouseLeave={e=>e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}>
            <div style={{fontSize:14,color:t.accent,fontWeight:500,marginBottom:4}}>{org.name} ↗</div>
            <div style={{fontSize:12,color:t.muted,lineHeight:1.6}}>{org.desc}</div>
          </a>
        ))}
      </div>
    </div>

    <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 18px",marginTop:24,fontSize:12,color:t.muted,lineHeight:1.7}}>
      All citations reflect peer-reviewed journals, professional standards documents, or foundational texts in the field. DOI links open to publisher pages — institutional or library access may be required for full-text articles. Free versions are linked where available (SAMHSA TIP Series, ACES Best Practices, PubMed Open Access).
    </div>
  </div>;
}

// ── Supervision Agreement Templates ───────────────────────────────────────
const DEFAULT_AGREEMENT = `SUPERVISION AGREEMENT

This Supervision Agreement is entered into between:

Supervisor: _____________________________, [Credentials], [License #]
Supervisee: _____________________________, [Current Credential]
Effective Date: _____________________________

---

1. PURPOSE OF SUPERVISION

The purpose of this supervision relationship is to support the professional development of the supervisee, ensure ethical and competent clinical practice, and fulfill the requirements of [State Licensing Board] for licensure as a [Licensure Goal].

---

2. SUPERVISION STRUCTURE

• Frequency: Individual supervision sessions will occur [weekly / biweekly], for a minimum of [X] hours per month.
• Format: Sessions will be held [in person / via telehealth / both].
• Group supervision: [If applicable — group sessions will occur [frequency] with [group name].]
• Duration of agreement: This agreement covers the period from ______ to ______, subject to renewal.

---

3. SUPERVISOR RESPONSIBILITIES

The supervisor agrees to:
• Provide regular, structured supervision in accordance with [State] licensing board requirements
• Review cases, session notes, and clinical documentation as needed
• Provide timely, constructive, and honest feedback on clinical skills and professional development
• Maintain awareness of the supervisee's full caseload and client welfare
• Be available for emergency consultation between scheduled sessions
• Complete and sign all required supervision documentation and hours verification
• Notify the supervisee of any concerns regarding clinical performance in a timely manner

---

4. SUPERVISEE RESPONSIBILITIES

The supervisee agrees to:
• Attend all scheduled supervision sessions and arrive prepared
• Present cases honestly and completely, including clinical concerns and ethical dilemmas
• Maintain accurate and timely clinical documentation
• Notify the supervisor promptly of any client crisis, ethical concern, or clinical emergency
• Practice only within the scope of their current training and competence
• Comply with all applicable laws, ethical codes, and licensing board requirements
• Maintain professional liability insurance throughout the supervision relationship

---

5. CONFIDENTIALITY

Information shared in supervision is confidential except in the following circumstances:
• The supervisee poses a risk of harm to themselves or others
• A client poses a risk of harm to themselves or others
• Abuse or neglect of a child, elderly person, or vulnerable adult is disclosed
• Required by law, court order, or licensing board investigation
• Client information shared for the purposes of consultation is de-identified

---

6. FEES AND PAYMENT

• Supervision fee: $_____ per [individual session / month]
• Payment method: [Stripe / Cash / Check / Venmo / Other]
• Payment due: [Date or frequency]
• Missed sessions: [Policy for late cancellation and missed sessions]
• Pro bono arrangement: [If applicable]

---

7. DOCUMENTATION OF HOURS

The supervisor will maintain accurate records of supervision hours provided. Supervisee hours will be verified and signed on a [monthly / quarterly] basis using the format required by [State Licensing Board / Credentialing Body].

---

8. EVALUATION

The supervisor will provide formal written evaluations:
• Mid-year evaluation: [Month]
• End-of-year / final evaluation: [Month]
Evaluations will address clinical skills, professional development, ethical conduct, and readiness for advancement toward licensure.

---

9. TERMINATION OF SUPERVISION

Either party may terminate this agreement with [30] days written notice. Grounds for immediate termination include serious ethical violations, client endangerment, or failure to maintain required licensure or insurance. Upon termination, the supervisor will provide a summary of hours completed and a final evaluation.

---

10. CRISIS PROTOCOL

In the event of a client crisis:
• The supervisee will contact the supervisor immediately or as soon as clinically safe to do so
• After-hours emergency contact: _____________________________
• If the supervisor is unreachable, the supervisee will contact [backup supervisor / crisis line / 988]

---

11. PROFESSIONAL DEVELOPMENT

The supervisee is encouraged to:
• Pursue continuing education relevant to their clinical population
• Read and discuss current literature in supervision sessions
• Develop a personal supervision model and theoretical orientation

---

12. ACKNOWLEDGMENT

By signing below, both parties agree to the terms of this Supervision Agreement and commit to a professional, ethical, and growth-oriented supervisory relationship.

Supervisor signature: _____________________________ Date: ____________

Supervisee signature: _____________________________ Date: ____________`;

function AgreementsPage({interns, supervisorName, T}) {
  const t = T||THEMES.sage;
  const [tab, setTab] = useState("template");
  const [template, setTemplate] = useState(DEFAULT_AGREEMENT);
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [letterInternId, setLetterInternId] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedAgreement, setGeneratedAgreement] = useState("");
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [letterPeriodStart, setLetterPeriodStart] = useState("August 2023");
  const [letterPeriodEnd, setLetterPeriodEnd] = useState("Present");
  const [supervisorCredential, setSupervisorCredential] = useState("LPC-S");
  const [supervisorLicense, setSupervisorLicense] = useState("");
  const [supervisorAddress, setSupervisorAddress] = useState("");
  const [sentList, setSentList] = useState([
    { internId:1, internName:"Marissa Holloway", sentDate:"Aug 12, 2023", status:"signed",    signedDate:"Aug 14, 2023" },
    { internId:2, internName:"Dev Castellano",   sentDate:"Jan 8, 2024",  status:"signed",    signedDate:"Jan 10, 2024" },
    { internId:3, internName:"Priya Nandakumar", sentDate:"Sep 5, 2023",  status:"signed",    signedDate:"Sep 6, 2023"  },
    { internId:5, internName:"Sofia Reyes",       sentDate:"Mar 5, 2025",  status:"signed",    signedDate:"Mar 7, 2025"  },
    { internId:6, internName:"Terry Brown",       sentDate:"Jun 10, 2025", status:"signed",    signedDate:"Jun 12, 2025" },
    { internId:7, internName:"Dana Okonkwo",      sentDate:"Jan 8, 2026",  status:"awaiting",  signedDate:null           },
  ]);

  const activeInterns = interns.filter(i=>i.status==="active");
  const selectedIntern = activeInterns.find(i=>i.id===selectedInternId);

  const saveTemplate = () => {
    setSavedMsg(true);
    setEditingTemplate(false);
    setTimeout(()=>setSavedMsg(false), 2500);
  };

  const generateCustom = async () => {
    if (!selectedIntern) return;
    setGenerating(true);
    const prompt = `You are helping a clinical supervisor create a supervision agreement. Generate a professional, complete supervision agreement customized for this specific supervisory relationship.

Supervisor: ${supervisorName||"[Supervisor Name]"}, LPC-S
Supervisee: ${selectedIntern.name}
Current credential: ${selectedIntern.credential}
Credentialing body: ${selectedIntern.credentialBody}
Licensure goal: ${selectedIntern.licenseGoal}
Start date: ${selectedIntern.startDate}
Supervisory role: ${selectedIntern.supervisorRole} supervisor
Payment: ${selectedIntern.proBono?"Pro bono (no fee)":"$"+selectedIntern.payments?.[0]?.amount+"/month"}
Discipline: ${selectedIntern.discipline||selectedIntern.internType}

Use the following as a base template and customize all details for this specific relationship:
${template}

Replace all bracketed placeholders with appropriate values based on the supervisory details above. Keep the professional format. Where specific details are unknown (like license numbers), leave a clear blank line. Make the language warm but professional.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY||localStorage.getItem("suptrack_api_key")||"","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({ model:"claude-sonnet-4-5", max_tokens:2000, messages:[{role:"user",content:prompt}] })
      });
      const data = await res.json();
      setGeneratedAgreement(data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"");
    } catch(e) { setGeneratedAgreement("Unable to generate. Please use the base template above."); }
    setGenerating(false);
  };

  const markSent = () => {
    if (!selectedIntern) return;
    const existing = sentList.find(s=>s.internId===selectedIntern.id);
    if (!existing) {
      setSentList(p=>[{internId:selectedIntern.id,internName:selectedIntern.name,sentDate:TODAY(),status:"awaiting",signedDate:null},...p]);
    }
  };

  const Card = ({children,style={}}) => <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)",...style}}>{children}</div>;

  return <div>
    <div style={{marginBottom:24}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Supervision Agreements</h1>
      <p style={{color:t.muted,fontSize:14,margin:0}}>Customize your agreement template, generate intern-specific versions, and track signatures</p>
    </div>

    {/* Tab nav */}
    <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,marginBottom:24}}>
      {[{id:"template",label:"Agreement Template"},{id:"generate",label:"✦ Generate for Intern"},{id:"tracker",label:"Signature Tracker"},{id:"letter",label:"📄 Attestation Letter"}].map(tt=>(
        <button key={tt.id} onClick={()=>setTab(tt.id)}
          style={{background:"none",border:"none",borderBottom:tab===tt.id?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 16px",cursor:"pointer",fontSize:13,color:tab===tt.id?t.accent:t.muted,fontFamily:"'DM Mono',monospace",marginBottom:-1}}>
          {tt.label}
        </button>
      ))}
    </div>

    {/* ── TEMPLATE TAB ── */}
    {tab==="template"&&<div>
      <Card style={{marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:3}}>Your master template</div>
            <div style={{fontSize:13,color:t.muted}}>This is the base agreement used for all new supervisees. Customize it once and it applies everywhere.</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {savedMsg&&<span style={{fontSize:12,color:S.green,fontFamily:"'DM Mono',monospace"}}>✓ Saved</span>}
            {editingTemplate
              ? <><Btn T={t} small onClick={saveTemplate}>Save template</Btn><Btn T={t} variant="secondary" small onClick={()=>setEditingTemplate(false)}>Cancel</Btn></>
              : <><Btn T={t} variant="secondary" small onClick={()=>setEditingTemplate(true)}>Edit template</Btn><Btn T={t} variant="secondary" small onClick={()=>{const el=document.createElement("a");el.href="data:text/plain;charset=utf-8,"+encodeURIComponent(template);el.download="SupTrack_Supervision_Agreement_Template.txt";el.click();}}>↓ Download</Btn></>
            }
          </div>
        </div>
        {editingTemplate
          ? <textarea value={template} onChange={e=>setTemplate(e.target.value)}
              style={{width:"100%",minHeight:600,border:`1px solid ${t.accentMid}`,borderRadius:10,padding:"16px 18px",fontSize:13,fontFamily:"'DM Mono',monospace",color:t.text,background:t.bg,resize:"vertical",boxSizing:"border-box",outline:"none",lineHeight:1.8}}/>
          : <pre style={{fontSize:13,color:t.text,lineHeight:1.8,whiteSpace:"pre-wrap",margin:0,fontFamily:"'DM Mono',monospace",background:t.surfaceAlt,borderRadius:10,padding:"16px 18px",maxHeight:500,overflowY:"auto"}}>{template}</pre>
        }
      </Card>
      <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"12px 16px",fontSize:13,color:t.accentText}}>
        Tip: Use the "Generate for Intern" tab to let AI customize this template for a specific supervisee — it fills in their name, credentials, licensure goal, and payment details automatically.
      </div>
    </div>}

    {/* ── GENERATE TAB ── */}
    {tab==="generate"&&<div>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:6}}>Select a supervisee</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:14}}>The AI will customize the template with their specific details — credential, licensure goal, payment arrangement, and more.</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
          {activeInterns.map(intern=>(
            <button key={intern.id} onClick={()=>{setSelectedInternId(intern.id);setGeneratedAgreement("");}}
              style={{background:selectedInternId===intern.id?t.accentLight:t.surfaceAlt,color:selectedInternId===intern.id?t.accentText:t.text,border:`1px solid ${selectedInternId===intern.id?t.accentMid:t.border}`,borderRadius:10,padding:"8px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,transition:"all 0.1s"}}>
              <Avatar initials={intern.initials} size={24} T={t} photo={intern.photo}/>
              <span style={{fontSize:13}}>{dn(intern)}</span>
            </button>
          ))}
        </div>
        {selectedIntern&&<div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px",marginBottom:14,display:"flex",gap:16,flexWrap:"wrap"}}>
          {[["Credential",selectedIntern.credential],["Goal",selectedIntern.licenseGoal],["Body",selectedIntern.credentialBody],["Payment",selectedIntern.proBono?"Pro bono":"$"+selectedIntern.payments?.[0]?.amount+"/mo"]].map(([label,val])=>(
            <div key={label}><span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</span><div style={{fontSize:13,color:t.text,marginTop:2}}>{val}</div></div>
          ))}
        </div>}
        <Btn T={t} onClick={generateCustom} disabled={!selectedIntern||generating}>
          {generating?"✦ Generating...":"✦ Generate customized agreement"}
        </Btn>
      </Card>

      {generating&&<div style={{display:"flex",gap:8,alignItems:"center",color:t.muted,fontSize:14,padding:"20px 0"}}>
        <div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:t.accentMid,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}</div>
        Writing agreement for {dn(selectedIntern)}...
      </div>}

      {generatedAgreement&&<Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:15,color:t.text,fontWeight:500}}>Agreement for {dn(selectedIntern)}</div>
          <div style={{display:"flex",gap:8}}>
            <Btn T={t} variant="secondary" small onClick={generateCustom}>↻ Regenerate</Btn>
            <Btn T={t} variant="secondary" small onClick={()=>{const el=document.createElement("a");el.href="data:text/plain;charset=utf-8,"+encodeURIComponent(generatedAgreement);el.download=`SupTrack_Agreement_${selectedIntern.name.replace(/ /g,"_")}.txt`;el.click();}}>↓ Download</Btn>
            <Btn T={t} small onClick={()=>{markSent();setTab("tracker");}}>✓ Mark as sent</Btn>
          </div>
        </div>
        <pre style={{fontSize:13,color:t.text,lineHeight:1.8,whiteSpace:"pre-wrap",margin:0,fontFamily:"'DM Mono',monospace",background:t.surfaceAlt,borderRadius:10,padding:"16px 18px",maxHeight:600,overflowY:"auto"}}>{generatedAgreement}</pre>
      </Card>}
    </div>}

    {/* ── TRACKER TAB ── */}
    {tab==="tracker"&&<div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:20}}>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontFamily:"inherit",fontSize:28,color:S.green,lineHeight:1}}>{sentList.filter(s=>s.status==="signed").length}</div>
          <div style={{fontSize:12,color:t.muted,marginTop:4}}>Signed</div>
        </div>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontFamily:"inherit",fontSize:28,color:S.amber,lineHeight:1}}>{sentList.filter(s=>s.status==="awaiting").length}</div>
          <div style={{fontSize:12,color:t.muted,marginTop:4}}>Awaiting signature</div>
        </div>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"18px 20px",textAlign:"center",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontFamily:"inherit",fontSize:28,color:S.red,lineHeight:1}}>{activeInterns.filter(i=>!sentList.find(s=>s.internId===i.id)).length}</div>
          <div style={{fontSize:12,color:t.muted,marginTop:4}}>No agreement on file</div>
        </div>
      </div>

      <Card>
        <div style={{fontSize:15,color:t.text,fontWeight:500,marginBottom:16}}>Agreement status by supervisee</div>
        {[...sentList].sort((a,b)=>a.status==="awaiting"?-1:1).map((entry,i)=>(
          <div key={entry.internId} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:i>0?`1px solid ${t.borderLight}`:"none"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{entry.internName}</div>
              <div style={{fontSize:12,color:t.muted,marginTop:2,fontFamily:"'DM Mono',monospace"}}>Sent {entry.sentDate}{entry.signedDate?` · Signed ${entry.signedDate}`:""}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {entry.status==="signed"
                ? <Badge color={S.green} bg={S.greenLight}>✓ Signed</Badge>
                : <Badge color={S.amber} bg={S.amberLight}>Awaiting signature</Badge>}
              <button onClick={()=>setSentList(p=>p.map(s=>s.internId===entry.internId?{...s,status:"signed",signedDate:"Mar 21, 2026"}:s))}
                style={{background:"none",border:`1px solid ${t.border}`,borderRadius:6,padding:"4px 10px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
                {entry.status==="signed"?"Undo":"Mark signed"}
              </button>
            </div>
          </div>
        ))}
        {/* Interns with no agreement */}
        {activeInterns.filter(i=>!sentList.find(s=>s.internId===i.id)).map((intern,i)=>(
          <div key={intern.id} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderTop:`1px solid ${t.borderLight}`}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500}}>{intern.name}</div>
              <div style={{fontSize:12,color:S.red,marginTop:2}}>No agreement on file</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Badge color={S.red} bg={S.redLight}>None on file</Badge>
              <button onClick={()=>{setSelectedInternId(intern.id);setGeneratedAgreement("");setTab("generate");}}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                Generate →
              </button>
            </div>
          </div>
        ))}
      </Card>
    </div>}

    {/* ── ATTESTATION LETTER TAB ── */}
    {tab==="letter"&&<div>
      <Card style={{marginBottom:16}}>
        <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:4}}>Supervisor attestation letter</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:18,lineHeight:1.6}}>
          Every licensing board accepts a formal letter from the supervisor confirming supervision hours and the supervisory relationship. Generate one here with your info and the intern's hours pre-filled — then print or save as PDF.
        </div>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Your information</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          {[["Credential","e.g. LPC-S",supervisorCredential,setSupervisorCredential],["License number","e.g. NV-LPC-12345",supervisorLicense,setSupervisorLicense]].map(([label,ph,val,setter])=>(
            <div key={label}>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>{label}</div>
              <input value={val} onChange={e=>setter(e.target.value)} placeholder={ph} style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
            </div>
          ))}
        </div>
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Address / Practice (optional)</div>
          <input value={supervisorAddress} onChange={e=>setSupervisorAddress(e.target.value)} placeholder="123 Main St, Suite 100, Reno, NV 89501" style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
        </div>
        <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:10}}>Select supervisee</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {interns.map(intern=>(
            <button key={intern.id} onClick={()=>{setLetterInternId(intern.id);setGeneratedLetter("");}}
              style={{background:letterInternId===intern.id?t.accentLight:t.surfaceAlt,color:letterInternId===intern.id?t.accentText:t.text,border:`1px solid ${letterInternId===intern.id?t.accentMid:t.border}`,borderRadius:10,padding:"7px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:7,fontSize:13,transition:"all 0.1s"}}>
              <Avatar initials={intern.initials} size={22} T={t}/>
              {intern.name}
            </button>
          ))}
        </div>
        {letterInternId&&(()=>{
          const li=interns.find(i=>i.id===letterInternId);
          const indivHrs=(li.hourLog||[]).find(e=>e.category==="individual_supervision")?.hours||0;
          const groupHrs=(li.hourLog||[]).find(e=>e.category==="group_supervision")?.hours||0;
          const supHrs=indivHrs+groupHrs;
          return <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Supervision period start</div>
                <input value={letterPeriodStart} onChange={e=>setLetterPeriodStart(e.target.value)} placeholder="e.g. August 2023" style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:4}}>Supervision period end</div>
                <input value={letterPeriodEnd} onChange={e=>setLetterPeriodEnd(e.target.value)} placeholder="e.g. Present" style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"7px 10px",fontSize:13,fontFamily:"inherit",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px",marginBottom:14,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
              {[["Individual",indivHrs+" hrs"],["Group",groupHrs+" hrs"],["Total supervised",supHrs+" hrs"]].map(([label,val])=>(
                <div key={label}><div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:2}}>{label}</div><div style={{fontSize:15,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{val}</div></div>
              ))}
            </div>
            <Btn T={t} onClick={async()=>{
              if(!window.__SUPTRACK_API_KEY){setGeneratedLetter("⚠ No API key set. Add your Anthropic API key in ✦ Consult AI first.");return;}
              setGeneratingLetter(true);setGeneratedLetter("");
              const prompt=`Write a formal supervisor attestation letter for a clinical intern's licensing board application.

Supervisor: ${supervisorName||"[Supervisor Name]"}, ${supervisorCredential||"LPC-S"}${supervisorLicense?`
License number: ${supervisorLicense}`:""}${supervisorAddress?`
Address: ${supervisorAddress}`:""}

Supervisee: ${li.name}${li.pronouns?` (${li.pronouns})`:""}, ${li.credential}
Credentialing body: ${li.credentialBody}
Licensure goal: ${li.licenseGoal}
Supervisory role: ${li.supervisorRole} supervisor
Supervision period: ${letterPeriodStart} through ${letterPeriodEnd}
Individual supervision hours: ${indivHrs}
Group supervision hours: ${groupHrs}
Total supervision hours: ${supHrs}

Write a formal attestation letter for submission to a state licensing board. Include:
1. Date and "To Whom It May Concern:" salutation
2. Statement confirming the supervisory relationship, dates, and type of supervision
3. Hours breakdown (individual and group)
4. Brief statement of intern's progress (professional and general — do not invent specific clinical details)
5. Attestation that hours were performed under qualified supervision
6. Closing with supervisor name, credential, license number placeholder, and [SIGNATURE] line

Professional, formal tone. Leave blanks for anything unknown.`;
              try{
                const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":window.__SUPTRACK_API_KEY,"anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:"claude-sonnet-4-5",max_tokens:1500,messages:[{role:"user",content:prompt}]})});
                const data=await res.json();
                setGeneratedLetter(data.content?.filter(c=>c.type==="text").map(c=>c.text).join("")||"Error — check API key.");
              }catch{setGeneratedLetter("Unable to generate. Check your Anthropic API key.");}
              setGeneratingLetter(false);
            }} disabled={generatingLetter}>{generatingLetter?"✦ Writing…":"✦ Generate attestation letter"}</Btn>
          </div>;
        })()}
      </Card>
      {generatingLetter&&<div style={{display:"flex",gap:8,alignItems:"center",color:t.muted,fontSize:14,padding:"16px 0"}}><div style={{display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:t.accentMid}}/>)}</div>Writing formal letter…</div>}
      {generatedLetter&&<Card>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <div style={{fontSize:15,color:t.text,fontWeight:500}}>Attestation letter — {interns.find(i=>i.id===letterInternId)?.name}</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{const el=document.createElement("a");el.href="data:text/plain;charset=utf-8,"+encodeURIComponent(generatedLetter);el.download=`Attestation_${interns.find(i=>i.id===letterInternId)?.name.replace(/ /g,"_")}.txt`;el.click();}} style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:7,padding:"6px 12px",cursor:"pointer",fontSize:12,color:t.text,fontFamily:"'DM Mono',monospace"}}>↓ Download</button>
            <button onClick={()=>window.print()} style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",fontWeight:500}}>🖨 Print / Save PDF</button>
          </div>
        </div>
        <pre style={{fontSize:13,color:t.text,lineHeight:1.9,whiteSpace:"pre-wrap",margin:0,fontFamily:"'DM Mono',monospace",background:t.surfaceAlt,borderRadius:10,padding:"20px 22px",maxHeight:640,overflowY:"auto"}}>{generatedLetter}</pre>
        <div style={{marginTop:12,fontSize:12,color:t.faint}}>Review, print, sign where indicated, and provide the signed copy to {interns.find(i=>i.id===letterInternId)?.name.split(" ")[0]}.</div>
      </Card>}
    </div>}
  </div>;
}

// ── Support Page (visible to all supervisors) ──────────────────────────────
function SupportPage({supervisorName, supervisorEmail, tickets, setTickets, T}) {
  const t = T||THEMES.sage;
  const [category, setCategory] = useState("bug");
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [sent, setSent]         = useState(false);
  const [tab, setTab]           = useState("new"); // new | mine

  const myTickets = tickets.filter(tk => tk.from === (supervisorEmail||supervisorName));

  const CATEGORIES = [
    { id:"bug",      label:"🐛 Bug report",       desc:"Something isn't working right" },
    { id:"feature",  label:"✨ Feature request",   desc:"An idea or improvement" },
    { id:"question", label:"❓ Question",           desc:"How does something work?" },
    { id:"billing",  label:"💳 Billing",            desc:"Questions about your plan or charges" },
    { id:"other",    label:"💬 Other",              desc:"Anything else" },
  ];

  const submit = () => {
    if (!subject.trim() || !message.trim()) return;
    const ticket = {
      id: `TK-${Date.now()}`,
      from: supervisorEmail || supervisorName || "Unknown supervisor",
      fromName: supervisorName || "Supervisor",
      category, subject: subject.trim(), message: message.trim(),
      date: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}),
      time: new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}),
      status: "open", // open | in-progress | resolved
      adminReply: "",
    };
    setTickets(p => [ticket, ...p]);
    setSent(true);
    setSubject(""); setMessage(""); setCategory("bug");
    setTimeout(() => { setSent(false); setTab("mine"); }, 2000);
  };

  const statusStyle = (s) => ({
    open:        { color:"#B87D2A", bg:"#FAF2E0", label:"Open" },
    "in-progress":{ color:t.accentText, bg:t.accentLight, label:"In Progress" },
    resolved:    { color:"#2E7A4E", bg:"#E8F5EE", label:"Resolved" },
  }[s] || { color:t.muted, bg:t.surfaceAlt, label:s });

  return <div>
    <div style={{marginBottom:24}}>
      <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Support</h1>
      <p style={{color:t.muted,fontSize:14,margin:0}}>Reach out to the SupTrack team — we read every message</p>
    </div>

    {/* Tabs */}
    <div style={{display:"flex",borderBottom:`1px solid ${t.border}`,marginBottom:24}}>
      {[{id:"new",label:"New message"},{id:"mine",label:`My tickets${myTickets.length>0?` (${myTickets.length})`:""}`}].map(tt=>(
        <button key={tt.id} onClick={()=>setTab(tt.id)}
          style={{background:"none",border:"none",borderBottom:tab===tt.id?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 16px",cursor:"pointer",fontSize:13,color:tab===tt.id?t.accent:t.muted,fontFamily:"'DM Mono',monospace",marginBottom:-1}}>
          {tt.label}
        </button>
      ))}
    </div>

    {tab==="new"&&<div style={{maxWidth:620}}>
      {sent&&<div style={{background:"#E8F5EE",border:"1px solid #A8D8BC",borderRadius:10,padding:"12px 18px",marginBottom:20,fontSize:14,color:"#2E7A4E"}}>
        ✓ Message sent! We'll get back to you soon. Check "My tickets" to track the status.
      </div>}

      {/* Category */}
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:12}}>What can we help with?</div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {CATEGORIES.map(c=>(
            <button key={c.id} onClick={()=>setCategory(c.id)}
              style={{background:category===c.id?t.accentLight:t.surfaceAlt,color:category===c.id?t.accentText:t.muted,border:`1px solid ${category===c.id?t.accentMid:t.border}`,borderRadius:10,padding:"8px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.1s"}}>
              <div style={{fontSize:13,fontWeight:category===c.id?500:400}}>{c.label}</div>
              <div style={{fontSize:11,marginTop:2,opacity:0.75}}>{c.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Subject */}
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:10}}>Subject</div>
        <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Brief description of your issue or idea..."
          style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",boxSizing:"border-box"}}/>
      </div>

      {/* Message */}
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",marginBottom:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
        <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:10}}>Message</div>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={6}
          placeholder="Tell us what's happening, what you expected, or what you'd love to see added. The more detail, the better."
          style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6}}/>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
          <div style={{fontSize:12,color:t.faint}}>Sending as {supervisorName||"you"}</div>
          <button onClick={submit} disabled={!subject.trim()||!message.trim()}
            style={{background:subject.trim()&&message.trim()?t.accent:t.borderLight,color:subject.trim()&&message.trim()?"#fff":t.faint,border:"none",borderRadius:9,padding:"10px 24px",cursor:subject.trim()&&message.trim()?"pointer":"default",fontSize:14,fontWeight:500,fontFamily:"inherit",transition:"all 0.15s"}}>
            Send message →
          </button>
        </div>
      </div>

      {/* Quick links */}
      <div style={{background:t.surfaceAlt,borderRadius:12,padding:"16px 18px",fontSize:13,color:t.muted,lineHeight:1.8}}>
        <div style={{fontWeight:500,color:t.text,marginBottom:6}}>Before reaching out, you might find answers here:</div>
        <div>📖 <span style={{color:t.accentText,cursor:"pointer"}}>Documentation</span> — how-to guides and feature walkthroughs</div>
        <div>🛣️ <span style={{color:t.accentText,cursor:"pointer"}}>Roadmap</span> — see what's coming next</div>
        <div>📣 <span style={{color:t.accentText,cursor:"pointer"}}>Changelog</span> — recent updates and fixes</div>
      </div>
    </div>}

    {tab==="mine"&&<div>
      {myTickets.length===0
        ? <div style={{background:t.surfaceAlt,borderRadius:12,padding:40,textAlign:"center",color:t.muted,fontSize:14}}>No messages yet. Use the "New message" tab to reach out.</div>
        : myTickets.map(tk=>{
            const ss = statusStyle(tk.status);
            const cat = CATEGORIES.find(c=>c.id===tk.category);
            return <div key={tk.id} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 22px",marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:13,color:t.text,fontWeight:500}}>{tk.subject}</span>
                    <span style={{fontSize:11,color:ss.color,background:ss.bg,borderRadius:6,padding:"2px 8px",fontFamily:"'DM Mono',monospace"}}>{ss.label}</span>
                  </div>
                  <div style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{tk.id} · {cat?.label} · {tk.date} at {tk.time}</div>
                </div>
              </div>
              <div style={{fontSize:13,color:t.muted,lineHeight:1.6,background:t.surfaceAlt,borderRadius:8,padding:"10px 14px",marginBottom:tk.adminReply?10:0}}>{tk.message}</div>
              {tk.adminReply&&<div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:8,padding:"10px 14px"}}>
                <div style={{fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace",marginBottom:4}}>SUPTRACK TEAM · REPLY</div>
                <div style={{fontSize:13,color:t.text,lineHeight:1.6}}>{tk.adminReply}</div>
              </div>}
            </div>;
          })
      }
    </div>}
  </div>;
}

// ── Admin Inbox (owner only — not in nav, accessed via secret route) ────────
function AdminInboxPage({tickets, setTickets, T}) {
  const t = T||THEMES.sage;
  const [filter, setFilter]     = useState("all"); // all | open | in-progress | resolved
  const [selected, setSelected] = useState(null);
  const [reply, setReply]       = useState("");
  const [sending, setSending]   = useState(false);

  const shown = filter==="all" ? tickets : tickets.filter(tk=>tk.status===filter);

  const statusStyle = (s) => ({
    open:        { color:"#B87D2A", bg:"#FAF2E0" },
    "in-progress":{ color:t.accentText, bg:t.accentLight },
    resolved:    { color:"#2E7A4E", bg:"#E8F5EE" },
  }[s] || { color:t.muted, bg:t.surfaceAlt });

  const CATEGORY_LABELS = {bug:"🐛 Bug",feature:"✨ Feature",question:"❓ Question",billing:"💳 Billing",other:"💬 Other"};

  const sendReply = () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    setTimeout(()=>{
      setTickets(p=>p.map(tk=>tk.id===selected.id?{...tk,adminReply:reply.trim(),status:"resolved"}:tk));
      setSelected(prev=>({...prev,adminReply:reply.trim(),status:"resolved"}));
      setReply(""); setSending(false);
    },600);
  };

  const updateStatus = (id, status) => {
    setTickets(p=>p.map(tk=>tk.id===id?{...tk,status}:tk));
    if(selected?.id===id) setSelected(prev=>({...prev,status}));
  };

  const counts = { all:tickets.length, open:tickets.filter(t=>t.status==="open").length, "in-progress":tickets.filter(t=>t.status==="in-progress").length, resolved:tickets.filter(t=>t.status==="resolved").length };

  return <div style={{display:"flex",gap:0,height:"calc(100vh - 80px)"}}>
    {/* Left panel — ticket list */}
    <div style={{width:320,flexShrink:0,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",overflowY:"auto"}}>
      <div style={{padding:"0 0 16px",borderBottom:`1px solid ${t.border}`,marginBottom:12}}>
        <h2 style={{fontFamily:"inherit",fontSize:20,fontWeight:400,color:t.text,margin:"0 0 12px",letterSpacing:"-0.01em"}}>
          🔒 Admin Inbox
          <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginLeft:8,fontWeight:400}}>owner only</span>
        </h2>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["all","open","in-progress","resolved"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{background:filter===f?t.accentLight:"none",color:filter===f?t.accentText:t.muted,border:`1px solid ${filter===f?t.accentMid:t.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
              {f} ({counts[f]||0})
            </button>
          ))}
        </div>
      </div>

      {shown.length===0&&<div style={{padding:"30px 0",textAlign:"center",color:t.faint,fontSize:13}}>No tickets</div>}
      {shown.map(tk=>{
        const ss=statusStyle(tk.status);
        return <div key={tk.id} onClick={()=>setSelected(tk)}
          style={{padding:"12px 16px",borderRadius:10,cursor:"pointer",marginBottom:4,background:selected?.id===tk.id?t.accentLight:"none",border:`1px solid ${selected?.id===tk.id?t.accentMid:"transparent"}`,transition:"all 0.1s"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
            <span style={{fontSize:10,color:ss.color,background:ss.bg,borderRadius:4,padding:"1px 6px",fontFamily:"'DM Mono',monospace",flexShrink:0}}>{tk.status}</span>
            <span style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{CATEGORY_LABELS[tk.category]||tk.category}</span>
          </div>
          <div style={{fontSize:13,color:t.text,fontWeight:500,marginBottom:2,lineHeight:1.3}}>{tk.subject}</div>
          <div style={{fontSize:11,color:t.faint}}>{tk.fromName} · {tk.date}</div>
        </div>;
      })}
    </div>

    {/* Right panel — ticket detail */}
    <div style={{flex:1,padding:"0 0 0 28px",overflowY:"auto"}}>
      {!selected
        ? <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:t.faint,fontSize:14}}>Select a ticket to view and respond</div>
        : <div>
            {/* Header */}
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,paddingBottom:16,borderBottom:`1px solid ${t.border}`}}>
              <div>
                <div style={{fontSize:20,color:t.text,fontWeight:500,marginBottom:6}}>{selected.subject}</div>
                <div style={{fontSize:12,color:t.faint,fontFamily:"'DM Mono',monospace"}}>{selected.id} · from {selected.fromName} ({selected.from}) · {selected.date} at {selected.time}</div>
              </div>
              <div style={{display:"flex",gap:6,flexShrink:0}}>
                {["open","in-progress","resolved"].map(s=>(
                  <button key={s} onClick={()=>updateStatus(selected.id,s)}
                    style={{background:selected.status===s?t.accentLight:t.surfaceAlt,color:selected.status===s?t.accentText:t.muted,border:`1px solid ${selected.status===s?t.accentMid:t.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:"'DM Mono',monospace"}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Original message */}
            <div style={{background:t.surfaceAlt,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
              <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",marginBottom:8}}>MESSAGE · {CATEGORY_LABELS[selected.category]}</div>
              <div style={{fontSize:14,color:t.text,lineHeight:1.8,whiteSpace:"pre-wrap"}}>{selected.message}</div>
            </div>

            {/* Existing reply */}
            {selected.adminReply&&<div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:12,padding:"16px 18px",marginBottom:16}}>
              <div style={{fontSize:11,color:t.accentText,fontFamily:"'DM Mono',monospace",marginBottom:8}}>YOUR REPLY (sent)</div>
              <div style={{fontSize:14,color:t.text,lineHeight:1.8}}>{selected.adminReply}</div>
            </div>}

            {/* Reply composer */}
            <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:10}}>{selected.adminReply?"Update reply":"Write a reply"}</div>
              <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={5}
                placeholder={selected.adminReply?"Update your reply...":"Reply to this supervisor..."}
                style={{width:"100%",border:`1px solid ${t.border}`,borderRadius:8,padding:"10px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",resize:"vertical",boxSizing:"border-box",lineHeight:1.6,marginBottom:12}}/>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <button onClick={sendReply} disabled={!reply.trim()||sending}
                  style={{background:reply.trim()?t.accent:t.borderLight,color:reply.trim()?"#fff":t.faint,border:"none",borderRadius:9,padding:"10px 22px",cursor:reply.trim()?"pointer":"default",fontSize:14,fontWeight:500,fontFamily:"inherit"}}>
                  {sending?"Sending…":"Send reply & resolve"}
                </button>
                <button onClick={()=>updateStatus(selected.id,"in-progress")}
                  style={{background:"none",border:`1px solid ${t.border}`,borderRadius:9,padding:"10px 18px",cursor:"pointer",fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace"}}>
                  Mark in progress
                </button>
              </div>
            </div>
          </div>}
    </div>
  </div>;
}

function SettingsPage({theme,setTheme,setCustomTheme,font,setFont,darkMode,setDarkMode,highContrast,setHighContrast,supervisorName,setSupervisorName,T}) {
  const t=T||THEMES.sage;

  // ── Custom theme builder ──────────────────────────────────────────────────
  const [customAccent, setCustomAccent] = useState("#5B7B5E");
  const [customBgTone, setCustomBgTone] = useState("light"); // light | warm | cool | dark

  // Derive a full theme from a single accent hex + bg tone
  const hexToHsl = (hex) => {
    let r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b); let h,s,l=(max+min)/2;
    if(max===min){h=s=0;}else{const d=max-min;s=l>0.5?d/(2-max-min):d/(max+min);
      switch(max){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
    return [Math.round(h*360),Math.round(s*100),Math.round(l*100)];
  };
  const hslToHex = (h,s,l) => {
    s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return "#"+[f(0),f(8),f(4)].map(x=>Math.round(x*255).toString(16).padStart(2,"0")).join("");
  };

  const buildCustomTheme = (accentHex, bgTone) => {
    const [h,s,l] = hexToHsl(accentHex);
    const accentDark  = hslToHex(h, Math.min(s+10,100), Math.max(l-15,10));
    const accentLight = hslToHex(h, Math.max(s-30,10),  Math.min(l+38,96));
    const accentMid   = hslToHex(h, Math.max(s-15,15),  Math.min(l+20,88));
    const accentText  = hslToHex(h, Math.min(s+5,100),  Math.max(l-20,15));

    const bgMap = {
      light: { bg:hslToHex(h,Math.max(s-50,5),97),  surface:"#FFFFFF", surfaceAlt:hslToHex(h,Math.max(s-45,5),94), border:hslToHex(h,Math.max(s-40,8),87), borderLight:hslToHex(h,Math.max(s-45,5),91), text:hslToHex(h,Math.max(s-20,20),12), muted:hslToHex(h,Math.max(s-30,15),45), faint:hslToHex(h,Math.max(s-35,8),72) },
      warm:  { bg:hslToHex((h+15)%360,Math.max(s-45,8),96), surface:"#FFFFFF", surfaceAlt:hslToHex((h+10)%360,Math.max(s-40,8),93), border:hslToHex((h+10)%360,Math.max(s-35,10),86), borderLight:hslToHex((h+10)%360,Math.max(s-40,8),90), text:hslToHex(h,Math.max(s-15,20),10), muted:hslToHex(h,Math.max(s-25,15),42), faint:hslToHex(h,Math.max(s-35,8),70) },
      cool:  { bg:hslToHex((h+200)%360,Math.max(s-50,5),97), surface:"#FFFFFF", surfaceAlt:hslToHex((h+200)%360,Math.max(s-45,5),94), border:hslToHex((h+200)%360,Math.max(s-40,8),87), borderLight:hslToHex((h+200)%360,Math.max(s-45,5),91), text:hslToHex((h+200)%360,Math.max(s-20,20),12), muted:hslToHex((h+200)%360,Math.max(s-30,15),45), faint:hslToHex((h+200)%360,Math.max(s-35,8),72) },
      dark:  { bg:hslToHex(h,Math.max(s-30,10),8), surface:hslToHex(h,Math.max(s-25,10),12), surfaceAlt:hslToHex(h,Math.max(s-20,12),16), border:hslToHex(h,Math.max(s-15,15),24), borderLight:hslToHex(h,Math.max(s-20,12),20), text:hslToHex(h,Math.max(s-40,5),94), muted:hslToHex(h,Math.max(s-20,20),65), faint:hslToHex(h,Math.max(s-15,20),32) },
    };
    const bg = bgMap[bgTone];
    return { name:"Custom", swatch:accentHex, isCustom:true,
      ...bg, accent:accentHex, accentLight, accentMid, accentText,
      dark:{ bg:hslToHex(h,Math.max(s-20,15),7), surface:hslToHex(h,Math.max(s-15,15),11), surfaceAlt:hslToHex(h,Math.max(s-10,18),15), border:hslToHex(h,Math.max(s-5,20),22), borderLight:hslToHex(h,Math.max(s-10,18),18), text:hslToHex(h,Math.max(s-40,5),93), muted:hslToHex(h,Math.max(s-15,25),62), faint:hslToHex(h,Math.max(s-10,22),30), accent:hslToHex(h,s,Math.min(l+15,85)), accentLight:hslToHex(h,Math.max(s-15,15),14), accentMid:hslToHex(h,Math.max(s-5,20),26), accentText:hslToHex(h,Math.max(s-5,30),80) }
    };
  };

  const applyCustom = () => {
    const custom = buildCustomTheme(customAccent, customBgTone);
    setCustomTheme(custom);
    setTheme("custom");
  };

  // Preview swatch from current picker values
  const previewTheme = buildCustomTheme(customAccent, customBgTone);

  return <div>
    <h1 style={{fontFamily:"inherit",fontSize:28,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.02em"}}>Settings</h1>
    <p style={{color:t.muted,fontSize:14,margin:"0 0 28px"}}>Personalize your SupTrack</p>
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:4}}>Your name</div>
      <p style={{fontSize:13,color:t.muted,marginBottom:14}}>Used for your initials, sidebar, and documentation</p>
      <input value={supervisorName||""} onChange={e=>setSupervisorName&&setSupervisorName(e.target.value)} placeholder="e.g. Alyson K."
        style={{border:`1px solid ${t.border}`,borderRadius:8,padding:"9px 14px",fontSize:14,fontFamily:"'DM Sans',system-ui,sans-serif",color:t.text,background:t.bg,outline:"none",width:280,boxSizing:"border-box"}}/>
      <div style={{fontSize:12,color:t.faint,marginTop:6}}>Your initials will be {(supervisorName||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??"}</div>
    </div>
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:4}}>Appearance</div>
      <p style={{fontSize:13,color:t.muted,marginBottom:18}}>Light and dark mode — just like on your phone</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        {[{id:false,label:"Light",icon:"☀️",desc:"Bright and open"},{id:true,label:"Dark",icon:"🌙",desc:"Easy on the eyes"}].map(opt=>(
          <button key={String(opt.id)} onClick={()=>setDarkMode(opt.id)}
            style={{background:darkMode===opt.id?t.accentLight:t.surfaceAlt,border:`2px solid ${darkMode===opt.id?t.accent:t.border}`,borderRadius:12,padding:"16px 24px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:120,transition:"all 0.15s"}}>
            <span style={{fontSize:24}}>{opt.icon}</span>
            <div style={{fontSize:14,color:t.text,fontWeight:500}}>{opt.label}</div>
            <div style={{fontSize:12,color:t.muted}}>{opt.desc}</div>
          </button>
        ))}
        {/* High contrast */}
        <button onClick={()=>setHighContrast&&setHighContrast(h=>!h)}
          style={{background:highContrast?t.accentLight:t.surfaceAlt,border:`2px solid ${highContrast?t.accent:t.border}`,borderRadius:12,padding:"16px 24px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:120,transition:"all 0.15s"}}>
          <span style={{fontSize:24}}>◑</span>
          <div style={{fontSize:14,color:t.text,fontWeight:500}}>High contrast</div>
          <div style={{fontSize:12,color:t.muted}}>Accessibility</div>
        </button>
      </div>
    </div>
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:4}}>Color theme</div>
      <p style={{fontSize:13,color:t.muted,marginBottom:18}}>Choose a preset or build your own with the color picker below</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:20}}>
        {Object.entries(THEMES).map(([key,th])=><button key={key} onClick={()=>setTheme(key)} style={{background:theme===key?t.accentLight:t.surfaceAlt,border:`2px solid ${theme===key?t.accent:t.border}`,borderRadius:12,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,minWidth:130,transition:"all 0.15s"}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:
            key==="rainbow"?"linear-gradient(135deg,#9B6FD4,#C88AC8,#F4A0C0,#4DBDBD,#9B6FD4)":
            key==="mono"?"linear-gradient(135deg,#111 50%,#fff 50%)":
            th.isGradient?(th.gradient||th.swatch):
            th.swatch}}/>
          <div style={{textAlign:"left"}}>
            <div style={{fontSize:14,color:t.text,fontWeight:500}}>{th.name}</div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:1}}>Aa</div>
          </div>
        </button>)}
        {/* Custom slot */}
        {theme==="custom"&&<button style={{background:t.accentLight,border:`2px solid ${t.accent}`,borderRadius:12,padding:"14px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,minWidth:130}}>
          <div style={{width:22,height:22,borderRadius:"50%",background:customAccent}}/>
          <div style={{textAlign:"left"}}><div style={{fontSize:14,color:t.text,fontWeight:500}}>Custom</div><div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:1}}>Aa</div></div>
        </button>}
      </div>

      {/* Color wheel builder */}
      <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:12,padding:"20px 22px"}}>
        <div style={{fontSize:14,color:t.text,fontWeight:500,marginBottom:4}}>🎨 Custom color builder</div>
        <p style={{fontSize:13,color:t.muted,marginBottom:4}}>Don't like any of the preset themes? Build your own. Pick a base color and SupTrack automatically generates a full coordinated palette — accent, light, borders, text — so everything still looks polished.</p>
        <p style={{fontSize:12,color:t.faint,marginBottom:16,fontFamily:"'DM Mono',monospace"}}>Pick a color below → preview updates live → click "Apply custom theme" to use it</p>

        <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:20,alignItems:"start",marginBottom:18}}>
          {/* Color wheel */}
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{position:"relative",width:80,height:80}}>
              {/* Decorative rainbow ring */}
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"conic-gradient(#9B6FD4,#C88AC8,#F4A0C0,#4DBDBD,#9B6FD4,#9B6FD4)",padding:4}}>
                <div style={{width:"100%",height:"100%",borderRadius:"50%",background:t.surfaceAlt}}/>
              </div>
              {/* Actual color input */}
              <label style={{position:"absolute",inset:8,borderRadius:"50%",overflow:"hidden",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",background:customAccent,border:`3px solid ${t.surface}`,boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                <input type="color" value={customAccent} onChange={e=>setCustomAccent(e.target.value)}
                  style={{position:"absolute",width:"200%",height:"200%",top:"-50%",left:"-50%",opacity:0,cursor:"pointer"}}/>
              </label>
            </div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{customAccent.toUpperCase()}</div>
          </div>

          {/* Controls */}
          <div>
            <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:8}}>Background tone</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
              {[
                {id:"light", label:"Light",    desc:"Clean white"},
                {id:"warm",  label:"Warm",     desc:"Warm tint"},
                {id:"cool",  label:"Cool",     desc:"Cool tint"},
                {id:"dark",  label:"Dark",     desc:"Deep bg"},
              ].map(opt=>(
                <button key={opt.id} onClick={()=>setCustomBgTone(opt.id)}
                  style={{background:customBgTone===opt.id?customAccent:"none",color:customBgTone===opt.id?"#fff":t.muted,border:`1px solid ${customBgTone===opt.id?customAccent:t.border}`,borderRadius:8,padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",transition:"all 0.15s"}}>
                  {opt.label}
                  <div style={{fontSize:10,opacity:0.7,marginTop:1}}>{opt.desc}</div>
                </button>
              ))}
            </div>

            {/* Live preview strip */}
            <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center"}}>
              <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",marginRight:4}}>Preview:</div>
              {[previewTheme.bg,previewTheme.surface,previewTheme.surfaceAlt,previewTheme.border,previewTheme.accent,previewTheme.accentMid,previewTheme.accentLight,previewTheme.text].map((col,i)=>(
                <div key={i} title={col} style={{width:24,height:24,borderRadius:6,background:col,border:`1px solid ${t.border}`,flexShrink:0}}/>
              ))}
            </div>

            {/* Mini preview card */}
            <div style={{background:previewTheme.surface,border:`2px solid ${previewTheme.accent}`,borderRadius:10,padding:"10px 14px",marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:previewTheme.accentMid,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:previewTheme.accentText,fontFamily:"'DM Mono',monospace",fontWeight:600}}>AB</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,color:previewTheme.text,fontWeight:500}}>Supervisee Name</div>
                <div style={{fontSize:11,color:previewTheme.muted,marginTop:1}}>LPC-Intern · Primary</div>
              </div>
              <div style={{background:previewTheme.accentLight,color:previewTheme.accentText,fontSize:11,borderRadius:5,padding:"2px 8px",fontFamily:"'DM Mono',monospace"}}>Active</div>
            </div>

            <button onClick={applyCustom}
              style={{background:customAccent,color:"#fff",border:"none",borderRadius:9,padding:"10px 22px",cursor:"pointer",fontSize:14,fontWeight:500,fontFamily:"inherit",boxShadow:`0 2px 8px ${customAccent}60`}}>
              Apply this theme
            </button>
          </div>
        </div>
      </div>
    </div>

    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"22px 24px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:4}}>Display font</div>
      <p style={{fontSize:13,color:t.muted,marginBottom:18}}>Change the font used throughout SupTrack</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        {Object.entries(FONTS).map(([key,fnt])=><button key={key} onClick={()=>setFont(key)} style={{background:font===key?t.accentLight:t.surfaceAlt,border:`2px solid ${font===key?t.accent:t.border}`,borderRadius:12,padding:"14px 20px",cursor:"pointer",display:"flex",flexDirection:"column",gap:4,minWidth:140,textAlign:"left",transition:"all 0.15s"}}>
          <div style={{fontSize:16,color:t.text,fontFamily:fnt.display,fontWeight:400}}>{fnt.name}</div>
          <div style={{fontSize:12,color:t.muted,fontFamily:fnt.body}}>The quick brown fox</div>
        </button>)}
      </div>
    </div>

    <div style={{background:t.surface,border:`1px solid ${S.red}30`,borderRadius:14,padding:"22px 24px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontFamily:"inherit",fontSize:18,color:t.text,marginBottom:4}}>Reset prototype data</div>
      <p style={{fontSize:13,color:t.muted,marginBottom:16,lineHeight:1.6}}>
        Clears all saved changes (profiles, tags, hours, sessions, etc.) and restores the original demo data. Use this if you want to start fresh or if something seems broken.
      </p>
      <button
        onClick={()=>{
          if(window.confirm("Reset all data to the original demo? This cannot be undone.")){
            localStorage.removeItem("suptrack_interns");
            localStorage.removeItem("suptrack_groups");
            localStorage.removeItem("suptrack_lists");
            localStorage.removeItem("suptrack_colleagues");
            localStorage.removeItem("suptrack_theme");
            localStorage.removeItem("suptrack_font");
            localStorage.removeItem("suptrack_dark");
            localStorage.removeItem("suptrack_page");
            localStorage.removeItem("suptrack_intern_id");
            localStorage.removeItem("suptrack_ce");
            localStorage.removeItem("suptrack_billing");
            localStorage.removeItem("suptrack_tickets");
            localStorage.removeItem("suptrack_nav_order");
            localStorage.removeItem("suptrack_nav_hidden");
            localStorage.removeItem("suptrack_qa_order");
            localStorage.removeItem("suptrack_qa_hidden");
            localStorage.removeItem("suptrack_supname");
            localStorage.removeItem("suptrack_photo");
            localStorage.removeItem("suptrack_dismissed_reminders");
            localStorage.removeItem("suptrack_pending_onboard");
            localStorage.removeItem("suptrack_completed_onboard");
            window.location.reload();
          }
        }}
        style={{background:"none",border:`1px solid ${S.red}`,borderRadius:8,padding:"8px 20px",cursor:"pointer",fontSize:13,color:S.red,fontFamily:"'DM Mono',monospace"}}>
        Reset to demo data
      </button>
    </div>
  </div>;
}

// ── Intern Portal ──────────────────────────────────────────────────────────
// ── InternPortalHours — intern's own hours view with reporting periods ────────
function InternPortalHours({intern,onUpdate,T,F}) {
  const t=T||THEMES.sage;
  const f=F||FONTS.plus_jakarta;
  const [view,setView]=useState("current"); // current | periods | download

  const log      = intern.internHourLog || [];
  const total    = sumHours(log);
  const direct   = directHours(log);
  const indirect = indirectHours(log);

  // Simulated reporting periods — in production these would be board-defined
  const PERIODS = [
    { id:"p3", label:"Current period",      start:"Jan 1, 2026",  end:"Present",       hours:total,  direct, indirect },
    { id:"p2", label:"Jul – Dec 2025",      start:"Jul 1, 2025",  end:"Dec 31, 2025",  hours:840,    direct:720, indirect:120 },
    { id:"p1", label:"Jan – Jun 2025",      start:"Jan 1, 2025",  end:"Jun 30, 2025",  hours:622,    direct:540, indirect:82  },
    { id:"p0", label:"Aug – Dec 2023",      start:"Aug 1, 2023",  end:"Dec 31, 2023",  hours:380,    direct:320, indirect:60  },
  ];

  const downloadCSV=()=>{
    const customCats = intern.customHourCategories||[];
    const allCats=[...DEFAULT_CATEGORIES,...customCats.map(c=>typeof c==="string"?{id:`custom_${c}`,label:c,type:"direct"}:c)];
    const fullLog=allCats.map(cat=>{const e=log.find(x=>x.category===cat.id||x.label===cat.label);return e||{...cat,hours:0};});
    const rows=[
      [`Hours Report — ${dn(intern)}`],
      [`Generated: ${TODAY()}`],
      [`Credential: ${intern.credential} → ${intern.licenseGoal}`],
      [`Credentialing body: ${intern.credentialBody}`],
      [],
      ["Category","Type","Hours"],
      ...fullLog.map(e=>[e.label,e.type,e.hours]),
      [],
      ["","Grand Total",total],
      ["","Direct",direct],
      ["","Indirect",indirect],
      ["","Remaining",Math.max(0,intern.hoursTotal-total)],
    ];
    const csv=rows.map(r=>r.join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;a.download=`${intern.name.replace(/\s+/g,"_")}_hours_report.csv`;a.click();
    URL.revokeObjectURL(url);
  };

  return <div style={{display:"flex",flexDirection:"column",gap:16}}>
    {/* Summary */}
    <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
      <StatCard T={t} label="Total hours" value={total} color={t.accent}/>
      <StatCard T={t} label="Direct" value={direct} color={t.accent}/>
      <StatCard T={t} label="Indirect" value={indirect}/>
      <StatCard T={t} label="Remaining" value={Math.max(0,intern.hoursTotal-total)} sub={`of ${intern.hoursTotal} required`}/>
    </div>

    {/* Progress */}
    <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
        <span style={{fontSize:13,color:t.text}}>Progress toward {intern.licenseGoal}</span>
        <span style={{fontSize:13,color:t.accent,fontFamily:"'DM Mono',monospace"}}>{total} / {intern.hoursTotal} hrs</span>
      </div>
      <PBar value={Math.min(total,intern.hoursTotal)} total={intern.hoursTotal} T={t}/>
    </div>

    {/* View toggle */}
    <div style={{display:"flex",gap:8,borderBottom:`1px solid ${t.border}`,marginBottom:4}}>
      {[["current","My Hours"],["periods","Reporting Periods"],["download","Download"]].map(([id,label])=>(
        <button key={id} onClick={()=>setView(id)}
          style={{background:"none",border:"none",borderBottom:view===id?`2px solid ${t.accent}`:"2px solid transparent",padding:"8px 16px",cursor:"pointer",fontSize:13,color:view===id?t.accent:t.muted,fontFamily:"inherit",fontWeight:view===id?500:400,marginBottom:-1}}>
          {label}
        </button>
      ))}
    </div>

    {/* Current hours editor */}
    {view==="current"&&<InternHoursEditor key={intern.id} T={t} intern={intern} onUpdate={onUpdate}/>}

    {/* Reporting periods */}
    {view==="periods"&&<div>
      <div style={{fontSize:13,color:t.muted,marginBottom:14,lineHeight:1.6}}>
        Hours broken down by reporting period. Use these totals when submitting to your licensing board. Your current period updates as you log hours.
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {PERIODS.map((period,i)=>(
          <div key={period.id} style={{background:t.surface,border:`1px solid ${i===0?t.accentMid:t.border}`,borderRadius:12,padding:"16px 18px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <div>
                <div style={{fontSize:14,color:t.text,fontWeight:500}}>{period.label}</div>
                <div style={{fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:2}}>{period.start} — {period.end}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:20,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:700}}>{period.hours}</div>
                <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace"}}>total hours</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div style={{background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>Direct</div>
                <div style={{fontSize:16,color:t.accent,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{period.direct}</div>
              </div>
              <div style={{background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
                <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3}}>Indirect</div>
                <div style={{fontSize:16,color:t.muted,fontFamily:"'DM Mono',monospace",fontWeight:600}}>{period.indirect}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontSize:12,color:t.faint,marginTop:10,lineHeight:1.6}}>
        Reporting periods are set by your licensing board. Contact your supervisor if you believe any period totals are incorrect.
      </div>
    </div>}

    {/* Download */}
    {view==="download"&&<div>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"24px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>📊</div>
        <div style={{fontSize:16,color:t.text,fontWeight:500,marginBottom:6}}>Your hours report</div>
        <div style={{fontSize:13,color:t.muted,marginBottom:20,lineHeight:1.6,maxWidth:360,margin:"0 auto 20px"}}>
          Download a CSV file with all your logged hours, categories, totals, and remaining hours. Keep this for your records or submit alongside your board application.
        </div>
        <button onClick={downloadCSV}
          style={{background:t.isGradient?t.gradient:t.accent,backgroundSize:t.isGradient?"200% 200%":undefined,animation:t.isGradient?"gradientShift 5s ease infinite":undefined,color:"#fff",border:"none",borderRadius:10,padding:"12px 28px",cursor:"pointer",fontSize:14,fontWeight:500,fontFamily:"inherit"}}>
          ⬇ Download hours report (.csv)
        </button>
        <div style={{fontSize:11,color:t.faint,marginTop:10}}>Includes all categories, direct/indirect breakdown, and running total</div>
      </div>
    </div>}
  </div>;
}

function InternPortal({intern:initialIntern,groups,onExit,onUpdateIntern,supervisorPhoto,supervisorInitials,supervisorName:supervisorDisplayName,T,F}) {
  const t=T||THEMES.sage; const f=F||FONTS.fraunces;
  const [intern,setIntern]=useState(initialIntern);
  const [editProfileOpen,setEditProfileOpen]=useState(false);
  const handleUpdate=(updated)=>{
    setIntern(updated);
    onUpdateIntern&&onUpdateIntern(updated);
  };
  // Supervisor contact info — in production these come from the supervisor's profile
  const supervisorCredential = "LPC-S";
  // These come from the supervisor's public profile in production
  const supervisorLicense    = "TX-LPC-S-88421";
  const supervisorBody       = "CACREP / Texas State Board";
  const supervisorEmail      = `${(supervisorDisplayName||"supervisor").toLowerCase().replace(/\s+/g,".").replace(/[^a-z0-9.]/g,"")}@questcounseling.org`;
  const supervisorPhone      = "(775) 555-0182";
  const supervisorAgency     = "Quest Counseling";
  const [tab,setTab]=useState("hours");
  const tabs=["hours","sessions","documents","supervisor",...(!intern.proBono?["payments"]:[])];
  const tabLabel={hours:"My Hours",sessions:"Session Notes",documents:"My Documents",supervisor:"My Supervisor",payments:"Payments"};
  const memberGroups=groups.filter(g=>(intern.groupIds||[]).includes(g.id));

  return <div style={{display:"flex",minHeight:"100vh",background:t.bg,fontFamily:f.body}}>
    <link href={f.url} rel="stylesheet"/>
    {editProfileOpen&&<EditProfileModal T={t} intern={intern} onSave={handleUpdate} onClose={()=>setEditProfileOpen(false)}/>}
    <div style={{width:200,background:t.surface,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",padding:"24px 0",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
      <div style={{padding:"0 20px 24px"}}><div style={{fontFamily:f.display,fontSize:20,color:t.accent,letterSpacing:"-0.02em"}}>SupTrack</div><div style={{fontSize:10,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:2,letterSpacing:"0.06em"}}>SUPERVISEE PORTAL</div></div>
      <nav style={{flex:1}}>{tabs.map(tt=><button key={tt} onClick={()=>setTab(tt)} style={{width:"100%",background:tab===tt?t.accentLight:"none",border:"none",borderLeft:tab===tt?`3px solid ${t.accent}`:"3px solid transparent",padding:"11px 20px",cursor:"pointer",textAlign:"left",fontSize:13,color:tab===tt?t.accent:t.text,fontFamily:f.body,fontWeight:tab===tt?500:400}}>{tabLabel[tt]}</button>)}</nav>
      <div style={{padding:"14px 20px",borderTop:`1px solid ${t.border}`}}>
        <button onClick={onExit} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:12,fontFamily:"'DM Mono',monospace",padding:0,marginBottom:10}}>← Supervisor view</button>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
          <Avatar initials={intern.initials} size={30} T={t}/>
          <div>
            <div style={{fontSize:13,color:t.text,fontWeight:500}}>{dn(intern)}</div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>{intern.pronouns||intern.credential}</div>
          </div>
        </div>
        <button onClick={()=>setEditProfileOpen(true)}
          style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",width:"100%",textAlign:"center"}}>
          ✎ Edit my info
        </button>
      </div>
    </div>
    <div style={{flex:1,padding:"36px 40px",maxWidth:800,overflowY:"auto"}}>
      {/* Back to supervisor view — top */}
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}>
        <button onClick={onExit} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,color:t.muted,fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center",gap:6}}>
          ← Back to supervisor view
        </button>
      </div>
      <h1 style={{fontFamily:f.display,fontSize:26,fontWeight:400,color:t.text,margin:"0 0 4px",letterSpacing:"-0.01em"}}>Welcome, {dn(intern)}</h1>
      <p style={{color:t.muted,fontSize:14,margin:"0 0 28px"}}>Your supervision hub</p>
      {tab==="hours"&&<InternPortalHours intern={intern} onUpdate={handleUpdate} T={t} F={f}/>}
      {tab==="sessions"&&<div>
        {(intern.sessions||[]).map((s,i)=><div key={i} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",marginBottom:12}}><div style={{display:"flex",gap:8,marginBottom:8}}><Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge><Badge color={t.accentText} bg={t.accentLight}>{s.type}</Badge></div><p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7}}>{s.notes}</p></div>)}
        {memberGroups.map(g=>(g.sessions||[]).map((s,i)=><div key={`${g.id}-${i}`} style={{background:t.surface,borderLeft:`3px solid ${g.color}`,borderRadius:12,padding:"16px 18px",marginBottom:10,border:`1px solid ${g.color}40`}}><div style={{display:"flex",gap:8,marginBottom:8}}><Badge color={t.muted} bg={t.surfaceAlt}>{s.date}</Badge><Badge color={g.color} bg={g.colorLight}>{g.name}</Badge></div><p style={{fontSize:14,color:t.text,margin:0,lineHeight:1.7}}>{s.notes}</p></div>))}
        {(intern.sessions||[]).length===0&&memberGroups.every(g=>g.sessions.length===0)&&<div style={{fontSize:14,color:t.faint,textAlign:"center",padding:"32px 0"}}>No sessions logged yet.</div>}
      </div>}
      {tab==="documents"&&<DocumentsTab key={intern.id} intern={intern} onUpdateIntern={handleUpdate} T={t}/>}
      {tab==="supervisor"&&<div>
        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"24px",marginBottom:16,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{display:"flex",gap:18,marginBottom:20}}>
            <Avatar initials={supervisorInitials||"SV"} size={64} T={t} photo={supervisorPhoto}/>
            <div>
              <div style={{fontFamily:f.display,fontSize:22,color:t.text,marginBottom:4}}>{supervisorDisplayName||"Your Supervisor"}</div>
              <div style={{fontSize:13,color:t.muted}}>{supervisorCredential||"Licensed Clinical Supervisor"}</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[
              ["License number",   supervisorLicense||"On file"],
              ["Credential body",  supervisorBody||"State Board"],
              ["Email",            supervisorEmail||"Contact your supervisor"],
              ["Phone",            supervisorPhone||"Contact your supervisor"],
              ["Agency / practice",supervisorAgency||"Quest Counseling"],
              ["Supervision type", intern.supervisorRole==="primary"?"Primary supervision":"Secondary supervision"],
            ].map(([label,val])=>(
              <div key={label} style={{background:t.surfaceAlt,borderRadius:10,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:4}}>{label}</div>
                <div style={{fontSize:14,color:t.text}}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:14,padding:"20px 22px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
          <div style={{fontSize:13,color:t.muted,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:12}}>Emergency & after-hours contact</div>
          <div style={{fontSize:14,color:t.text,marginBottom:8}}>{supervisorPhone||"Contact information on file with your supervisor"}</div>
          <div style={{background:S.amberLight,border:`1px solid #E8C98A`,borderRadius:8,padding:"10px 14px",fontSize:13,color:S.amber,lineHeight:1.6}}>
            In a clinical emergency, contact your supervisor immediately. If unreachable, contact the crisis line at <strong>988</strong> or your agency's on-call supervisor.
          </div>
        </div>
      </div>}

      {tab==="payments"&&!intern.proBono&&<div>
        {/* Per-session billing agreement banner */}
        {intern.sessionBillingAgreed===undefined&&groups.filter(g=>intern.groupIds?.includes(g.id)&&g.chargePerSession).length>0&&(
          <div style={{background:t.accentLight,border:`2px solid ${t.accentMid}`,borderRadius:12,padding:"18px 20px",marginBottom:20}}>
            <div style={{fontSize:15,color:t.accentText,fontWeight:500,marginBottom:6}}>Per-session billing agreement</div>
            <div style={{fontSize:13,color:t.muted,lineHeight:1.7,marginBottom:14}}>
              Your supervisor charges per group supervision session you attend. You will only be charged for sessions where you are present — if you miss a session, you will not be charged for it.
              {groups.filter(g=>intern.groupIds?.includes(g.id)&&g.chargePerSession).map(g=>(
                <div key={g.id} style={{marginTop:6,fontFamily:"'DM Mono',monospace",fontSize:12}}>{g.name}: <strong>${g.sessionRate||0} per session</strong></div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>handleUpdate({...intern,sessionBillingAgreed:true})}
                style={{background:t.accent,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:500,fontFamily:"inherit"}}>
                ✓ I agree to per-session billing
              </button>
              <button onClick={()=>handleUpdate({...intern,sessionBillingAgreed:false})}
                style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,padding:"8px 18px",cursor:"pointer",fontSize:13,color:t.muted,fontFamily:"inherit"}}>
                Decline
              </button>
            </div>
          </div>
        )}
        {intern.sessionBillingAgreed===true&&<div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:12,color:t.accentText}}>
          ✓ You have agreed to per-session billing for attended group sessions
        </div>}

        <div style={{background:t.isGradient?(t.gradientSubtle||t.accentLight):t.accentLight,border:`1px solid ${t.isGradient?"transparent":t.accentMid}`,borderRadius:10,padding:"12px 16px",marginBottom:20,fontSize:13,color:t.accentText}}>
          Monthly supervision fee: <strong>${intern.payments[0]?.amount}/month</strong>
        </div>
        {(intern.payments||[]).map((p,i)=>{
          const methodIcons={cash:"💵",check:"📄",venmo:"💜",zelle:"⚡",paypal:"🅿",stripe:"💳",other:"●"};
          return <div key={i} style={{background:t.surface,border:`1px solid ${p.status==="overdue"?t.accentMid:t.border}`,borderLeftWidth:p.status==="overdue"?3:1,borderLeftColor:p.status==="overdue"?t.accent:t.border,borderRadius:12,padding:"14px 18px",display:"flex",alignItems:"center",marginBottom:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,color:t.text}}>{p.month}{p.description?` — ${p.description}`:""}</div>
              {p.receivedVia&&<div style={{fontSize:12,color:t.muted,marginTop:2}}>Received via {methodIcons[p.receivedVia]} {p.receivedVia}</div>}
            </div>
            <span style={{fontFamily:f.display,fontSize:18,color:t.text,marginRight:14}}>${p.amount}</span>
            {p.status==="paid"
              ? <Badge color={t.accentText} bg={t.accentLight}>Paid</Badge>
              : <Btn T={t}>Pay now — ${p.amount}</Btn>}
          </div>;
        })}
      </div>}
    </div>
  </div>;
}

// ── App Shell ──────────────────────────────────────────────────────────────
// ── Auth ──────────────────────────────────────────────────────────────────

// ── Error Boundary — catches render errors so app doesn't go blank ──────────
class ErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={hasError:false,error:null};}
  static getDerivedStateFromError(error){return {hasError:true,error};}
  componentDidCatch(error,info){console.error("SupTrack render error:",error,info);}
  render(){
    if(this.state.hasError){
      return <div style={{padding:40,fontFamily:"system-ui",maxWidth:600,margin:"80px auto"}}>
        <div style={{fontSize:24,fontWeight:600,color:"#1A1A2E",marginBottom:12}}>Something went wrong</div>
        <div style={{fontSize:14,color:"#666",marginBottom:20,lineHeight:1.6}}>
          SupTrack hit an unexpected error. This is usually caused by stale data in your browser.
        </div>
        <pre style={{fontSize:11,color:"#999",background:"#F5F5F5",padding:12,borderRadius:8,overflow:"auto",marginBottom:20}}>
          {this.state.error?.message||"Unknown error"}
        </pre>
        <button onClick={()=>{
          Object.keys(localStorage).filter(k=>k.startsWith("suptrack_")).forEach(k=>localStorage.removeItem(k));
          window.location.reload();
        }} style={{background:"#2A6080",color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontSize:14,fontWeight:500}}>
          Clear data and reload
        </button>
      </div>;
    }
    return this.props.children;
  }
}
function SupTrackInner() {
  const [session, setSession] = useState(null)

useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    setSession(session)
  })
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session)
  })
  return () => subscription.unsubscribe()
}, [])

  const [theme,setTheme]=useState(()=>{try{return localStorage.getItem("suptrack_theme")||"suptrack";}catch{return "suptrack";}});
  const [darkMode,setDarkMode]=useState(()=>{try{return localStorage.getItem("suptrack_dark")==="true";}catch{return false;}});
  const [highContrast,setHighContrast]=useState(true);
  const [fontKey,setFontKey]=useState(()=>{try{return localStorage.getItem("suptrack_font")||"plus_jakarta";}catch{return "plus_jakarta";}});
  const [customTheme,setCustomTheme]=useState(null);

  // Persist preferences
  React.useEffect(()=>{try{localStorage.setItem("suptrack_theme",theme);}catch{}},[theme]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_dark",darkMode);}catch{}},[darkMode]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_font",fontKey);}catch{}},[fontKey]);
  // ── Persistent state — survives page refresh via localStorage ──
  const [interns,setInterns]=useState(()=>{
    try{const s=localStorage.getItem("suptrack_interns");return s?JSON.parse(s):INITIAL_INTERNS;}
    catch{return INITIAL_INTERNS;}
  });
  const [groups,setGroups]=useState(()=>{
    try{const s=localStorage.getItem("suptrack_groups");return s?JSON.parse(s):INITIAL_GROUPS;}
    catch{return INITIAL_GROUPS;}
  });
  const [lists,setLists]=useState(()=>{
    try{const s=localStorage.getItem("suptrack_lists");return s?JSON.parse(s):INITIAL_LISTS;}
    catch{return INITIAL_LISTS;}
  });
  const [colleagues,setColleagues]=useState(()=>{
    try{const s=localStorage.getItem("suptrack_colleagues");return s?JSON.parse(s):INITIAL_COLLEAGUES;}
    catch{return INITIAL_COLLEAGUES;}
  });

  // Save to localStorage whenever state changes
  React.useEffect(()=>{try{localStorage.setItem("suptrack_interns",JSON.stringify(interns));}catch{}},[interns]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_groups",JSON.stringify(groups));}catch{}},[groups]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_lists",JSON.stringify(lists));}catch{}},[lists]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_colleagues",JSON.stringify(colleagues));}catch{}},[colleagues]);
  const [page,setPage]=useState(()=>{try{const p=localStorage.getItem("suptrack_page");return p&&["dashboard","interns","intern-profile","groups","payments","billing","ce","calendar","consult","lab","resources","discover","agreements","reminders","support","admin","profile","settings"].includes(p)?p:"dashboard";}catch{return "dashboard";}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_page",page);}catch{}},[page]);
  React.useEffect(()=>{const el=document.getElementById("suptrack-content");if(el)el.scrollTop=0;window.scrollTo(0,0);},[page]);
  const [selectedInternId_sv,setSelectedInternId_sv]=useState(()=>{try{const v=localStorage.getItem("suptrack_intern_id");return v?Number(v):null;}catch{return null;}});
  React.useEffect(()=>{try{if(selectedInternId_sv)localStorage.setItem("suptrack_intern_id",String(selectedInternId_sv));else localStorage.removeItem("suptrack_intern_id");}catch{}},[selectedInternId_sv]);
  const selectedIntern = interns.find(i=>i.id===selectedInternId_sv)||null;
  const [internFilter,setInternFilter]=useState(null); // null = show all
  const [internSort,setInternSort]=useState("group"); // default: by group
  const [internViewMode,setInternViewMode]=useState("list"); // list | grid | compact

  // All available quick actions — supervisors can toggle and reorder
  const ALL_QUICK_ACTIONS = [
    { id:"addintern",   label:"+ Add Intern",            icon:"👤", action:"addintern"  },
    { id:"logsession",  label:"Log Individual Session",  icon:"📝", action:"logsession" },
    { id:"loggroup",    label:"Log Group Session",        icon:"👥", action:"loggroup"   },
    { id:"payment",     label:"Send Payment Reminder",    icon:"💳", action:"payment"    },
    { id:"upload",      label:"Upload Document",          icon:"📄", action:"upload"     },
    { id:"ce",          label:"View CE Tracker",          icon:"🎓", action:"ce"         },
    { id:"consult",     label:"✦ Consult AI",             icon:"✦",  action:"consult"    },
    { id:"lab",         label:"✦ Supervision Lab",        icon:"✦",  action:"lab"        },
    { id:"groups",      label:"View Groups",              icon:"👥", action:"groups"     },
    { id:"payments_pg", label:"View Payments",            icon:"💰", action:"payments"   },
    { id:"agreements",  label:"View Agreements",          icon:"📋", action:"agreements" },
    { id:"onboard",     label:"Send Onboarding Link",     icon:"🔗", action:"onboard"    },
  ];
  const [quickActionOrder,  setQuickActionOrder]  = useState(()=>{try{const s=localStorage.getItem("suptrack_qa_order");return s?JSON.parse(s):ALL_QUICK_ACTIONS.map(a=>a.id);}catch{return ALL_QUICK_ACTIONS.map(a=>a.id);}});
  const [quickActionHidden, setQuickActionHidden] = useState(()=>{try{const s=localStorage.getItem("suptrack_qa_hidden");return s?new Set(JSON.parse(s)):new Set(["loggroup","upload","agreements","onboard","payments_pg","groups"]);}catch{return new Set(["loggroup","upload","agreements","onboard","payments_pg","groups"]);}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_qa_order",JSON.stringify(quickActionOrder));}catch{}},[quickActionOrder]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_qa_hidden",JSON.stringify([...quickActionHidden]));}catch{}},[quickActionHidden]);
  const [qaDragIdx, setQaDragIdx] = useState(null);

  const [portalInternId,setPortalInternId]=useState(null);
  const portalIntern = interns.find(i=>i.id===portalInternId)||null;
  const [navHover,setNavHover]=useState(null);

  const baseTheme = theme==="custom" && customTheme ? customTheme : (THEMES[theme] || THEMES.sage);
  const resolvedTheme = darkMode ? { ...baseTheme, ...baseTheme.dark } : baseTheme;
  // High contrast mode — stronger text, borders, and contrast ratios. Gradient stays, personality stays.
  const t = highContrast ? {
    ...resolvedTheme,
    text:        darkMode ? "#FFFFFF"   : "#000000",
    muted:       darkMode ? "#E0E0E0"   : "#1A1A1A",
    faint:       darkMode ? "#AAAAAA"   : "#444444",
    border:      darkMode ? "#888888"   : "#444444",
    borderLight: darkMode ? "#666666"   : "#666666",
    surface:     darkMode ? resolvedTheme.surface : "#FFFFFF",
    surfaceAlt:  darkMode ? resolvedTheme.surfaceAlt : "#F0F0F0",
    accentText:  darkMode ? "#FFFFFF"   : "#000000",
  } : resolvedTheme;
  const f=FONTS[fontKey]||FONTS.inter;

  const navigate = (dest, context) => {
    setInternFilter(dest === "interns" ? context : null);
    setPage(dest);
    setSelectedInternId_sv(null);
    if (dest === "groups") setSelectedGroupId(context);
  };

  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [ceData, setCeData] = useState(()=>{try{const s=localStorage.getItem("suptrack_ce");return s?JSON.parse(s):INITIAL_CE;}catch{return INITIAL_CE;}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_ce",JSON.stringify(ceData));}catch{}},[ceData]);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [addInternOpen, setAddInternOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(null);
  const [consultIntern, setConsultIntern] = useState(null);
  const [supervisorPhoto, setSupervisorPhoto] = useState(()=>{try{return localStorage.getItem("suptrack_photo")||null;}catch{return null;}});
  React.useEffect(()=>{try{if(supervisorPhoto)localStorage.setItem("suptrack_photo",supervisorPhoto);else localStorage.removeItem("suptrack_photo");}catch{}},[supervisorPhoto]);
  const [supervisorName, setSupervisorName] = useState(()=>{try{return localStorage.getItem("suptrack_supname")||"Alyson K.";}catch{return "Alyson K.";}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_supname",supervisorName);}catch{}},[supervisorName]);
  const supervisorInitials = supervisorName.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()||"??";

  const addSessionCharge=React.useCallback((internId, charge)=>{
    setInterns(p=>p.map(i=>{
      if(i.id!==internId) return i;
      return {...i, payments:[charge,...(i.payments||[])], paymentStatus:"overdue"};
    }));
  },[]);

  const updateIntern=React.useCallback((updated)=>{
    setInterns(p=>p.map(i=>i.id===updated.id?updated:i));
  },[]);

  // Billing state
  const BILLING_SEED = {
    plan:"starter",cycle:"monthly",trialDaysLeft:8,
    seats:[{id:"s1",name:"Alyson K.",email:"alyson@questcounseling.org",role:"owner"},{id:"s2",name:"Dr. Renee Faulkner",email:"rfaulkner@cbhc.org",role:"member",since:"Feb 2026"}],
    referralCode:"SUPTRACK-AK2026",
    referrals:[{name:"Marcus Webb",status:"trial",joined:"Mar 10, 2026",creditEarned:false,tier:1},{name:"Tanya Osei",status:"paid",joined:"Feb 1, 2026",creditEarned:true,tier:1}],
    tierProgress:{1:{required:1,earned:1,referrals:["Tanya Osei"],unlocked:true},2:{required:3,earned:0,referrals:[],unlocked:false},3:{required:10,earned:0,referrals:[],unlocked:false},4:{required:25,earned:0,referrals:[],unlocked:false}},
    credits:1,nextBilling:"Apr 21, 2026",
    foundingSeats:[{id:"f1",name:"Dr. Renee Faulkner",email:"rfaulkner@cbhc.org",since:"Jan 2026"},{id:"f2",name:"Marcus Webb",email:"mwebb@questcounseling.org",since:"Feb 2026"}],
    foundingSlotsTotal:5,
  };
  const [billing,setBilling]=useState(()=>{try{const s=localStorage.getItem("suptrack_billing");return s?JSON.parse(s):BILLING_SEED;}catch{return BILLING_SEED;}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_billing",JSON.stringify(billing));}catch{}},[billing]);

  const isAdmin = billing.seats.some(s => s.role==="owner" || s.role==="admin");
  const TICKETS_SEED = [
    {id:"TK-001",from:"rfaulkner@cbhc.org",fromName:"Dr. Renee Faulkner",category:"feature",subject:"Group note templates?",message:"It would save a lot of time if we could have pre-built templates for different group session types.",date:"Mar 20, 2026",time:"2:14 PM",status:"open",adminReply:""},
    {id:"TK-002",from:"rfaulkner@cbhc.org",fromName:"Dr. Renee Faulkner",category:"bug",subject:"Hours comparison showing wrong discrepancy",message:"The comparison between my logged hours and my intern's reported hours is showing a discrepancy of 2 hours.",date:"Mar 18, 2026",time:"9:30 AM",status:"in-progress",adminReply:"Thanks for flagging this — fix deploying this week."},
  ];
  const [tickets,setTickets]=useState(()=>{try{const s=localStorage.getItem("suptrack_tickets");return s?JSON.parse(s):TICKETS_SEED;}catch{return TICKETS_SEED;}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_tickets",JSON.stringify(tickets));}catch{}},[tickets]);


  const ALL_NAV_ITEMS = [
    {id:"dashboard",  label:"Dashboard",        required:true},
    {id:"interns",    label:"Supervisees",       required:true},
    {id:"groups",     label:"Groups"},
    {id:"calendar",   label:"Calendar"},
    {id:"payments",   label:"Payments"},
    {id:"ce",         label:"CE Tracker"},
    {id:"resources",  label:"Resources"},
    {id:"agreements", label:"Agreements"},
    {id:"reminders",   label:"Reminders"},
    {id:"discover",   label:"🔭 Discover"},
    {id:"profile",    label:"My Profile"},
    {id:"billing",    label:"Plan & Billing"},
    {id:"support",    label:"Support"},
    {id:"settings",   label:"Settings"},
  ];
  const [navOrder,  setNavOrder]  = useState(()=>{try{const s=localStorage.getItem("suptrack_nav_order");return s?JSON.parse(s):ALL_NAV_ITEMS.map(n=>n.id);}catch{return ALL_NAV_ITEMS.map(n=>n.id);}});
  const [navHidden, setNavHidden] = useState(()=>{try{const s=localStorage.getItem("suptrack_nav_hidden");return s?new Set(JSON.parse(s)):new Set();}catch{return new Set();}});
  React.useEffect(()=>{try{localStorage.setItem("suptrack_nav_order",JSON.stringify(navOrder));}catch{}},[navOrder]);
  React.useEffect(()=>{try{localStorage.setItem("suptrack_nav_hidden",JSON.stringify([...navHidden]));}catch{}},[navHidden]);
  const [editingNav, setEditingNav] = useState(false);
  const [navDrag, setNavDrag] = useState(null);

  const navItems = navOrder
    .map(id => ALL_NAV_ITEMS.find(n=>n.id===id))
    .filter(n => n && !navHidden.has(n.id));
if (!session) return <Auth />
  const handleNavDragStart = (id) => setNavDrag(id);
  const handleNavDragOver  = (e, overId) => {
    e.preventDefault();
    if (!navDrag || navDrag===overId) return;
    setNavOrder(prev => {
      const arr = [...prev];
      const from = arr.indexOf(navDrag);
      const to   = arr.indexOf(overId);
      if (from<0||to<0) return prev;
      arr.splice(from,1); arr.splice(to,0,navDrag);
      return arr;
    });
  };
  const handleNavDragEnd = () => setNavDrag(null);

  if(portalIntern) return <InternPortal T={t} F={f} intern={portalIntern} groups={groups} onExit={()=>{
    setPortalInternId(null);
  }} onUpdateIntern={updateIntern} supervisorPhoto={supervisorPhoto} supervisorInitials={supervisorInitials} supervisorName={supervisorName}/>;

  return <div style={{display:"flex",minHeight:"100vh",background:t.bg,fontFamily:f.body}}>
    <link href={f.url} rel="stylesheet"/>
    <style>{`
    *, *::before, *::after { box-sizing: border-box; }
    body, button, input, select, textarea { font-family: ${f.body} !important; }
    h1, h2, h3 { font-family: ${f.display} !important; }
    ${t.isRainbow ? `
      @keyframes rainbowShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      .rainbow-active { background: linear-gradient(90deg,#9B6FD4,#C88AC8,#F4A0C0,#4DBDBD,#9B6FD4) !important; background-size: 300% 300% !important; animation: rainbowShift 4s ease infinite !important; -webkit-background-clip: text !important; -webkit-text-fill-color: transparent !important; background-clip: text !important; }
      .rainbow-border { border-left-color: transparent !important; border-image: linear-gradient(180deg,#9B6FD4,#C88AC8,#F4A0C0,#4DBDBD,#9B6FD4) 1 !important; }
    ` : ""}
    ${t.isGradient ? `
      @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      @keyframes gradientShiftSlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      .gradient-btn { background: ${t.gradient} !important; background-size:200% 200% !important; animation: gradientShift 5s ease infinite !important; color:#fff !important; border:none !important; }
      .gradient-bar { background: ${t.gradient} !important; background-size:200% 200% !important; animation: gradientShift 5s ease infinite !important; }
      .gradient-text { background: ${t.gradient} !important; background-size:200% 200% !important; animation: gradientShift 5s ease infinite !important; -webkit-background-clip:text !important; -webkit-text-fill-color:transparent !important; background-clip:text !important; }
      .gradient-border { border-image: ${t.gradient} 1 !important; }
      .gradient-subtle { background: ${t.gradientSubtle||t.gradient} !important; }
      .gradient-badge { background: ${t.gradientMid||t.gradient} !important; }
    ` : ""}`}</style>

    {/* Sidebar */}
    <div style={{width:228,background:t.surface,borderRight:`1px solid ${t.border}`,display:"flex",flexDirection:"column",padding:"26px 0",position:"sticky",top:0,height:"100vh",flexShrink:0}}>
      <div style={{padding:"0 24px 20px",display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
        <div>
          <div onClick={()=>{setPage("dashboard");setSelectedInternId_sv(null);setInternFilter(null);setConsultIntern(null);}}
            style={{fontFamily:f.display,fontSize:22,letterSpacing:"-0.02em",cursor:"pointer",display:"inline-block",
            ...(t.isRainbow
              ? {background:"linear-gradient(90deg,#9B6FD4,#C88AC8,#F4A0C0,#4DBDBD,#9B6FD4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}
              : t.isGradient && t.gradient
              ? {background:t.gradient.replace("135deg","90deg"),WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",backgroundSize:"200% 200%",animation:"gradientShift 5s ease infinite"}
              : {color:t.accent})}}>SupTrack</div>
          <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",marginTop:2,letterSpacing:"0.07em"}}>SUPERVISION PLATFORM</div>
        </div>
        <button onClick={()=>setEditingNav(e=>!e)} title="Customize sidebar"
          style={{background:editingNav?t.accentLight:"none",border:`1px solid ${editingNav?t.accentMid:t.border}`,borderRadius:6,padding:"4px 7px",cursor:"pointer",fontSize:12,color:editingNav?t.accentText:t.faint,marginTop:2,lineHeight:1,flexShrink:0}}
          onMouseEnter={e=>{if(!editingNav)e.currentTarget.style.color=t.muted;}}
          onMouseLeave={e=>{if(!editingNav)e.currentTarget.style.color=t.faint;}}>
          ⠿
        </button>
      </div>

      {editingNav
        /* ── Edit mode ── */
        ? <div style={{flex:1,overflowY:"auto",padding:"0 12px"}}>
            <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8,padding:"0 4px"}}>Drag to reorder · toggle to show/hide</div>
            {navOrder.map(id=>{
              const item = ALL_NAV_ITEMS.find(n=>n.id===id);
              if (!item) return null;
              const hidden = navHidden.has(id);
              const isDragging = navDrag===id;
              return (
                <div key={id}
                  draggable
                  onDragStart={()=>handleNavDragStart(id)}
                  onDragOver={e=>handleNavDragOver(e,id)}
                  onDragEnd={handleNavDragEnd}
                  style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",borderRadius:8,marginBottom:3,background:isDragging?t.accentLight:t.surfaceAlt,opacity:hidden?0.4:1,cursor:"grab",border:`1px solid ${isDragging?t.accentMid:t.border}`,transition:"opacity 0.15s"}}>
                  <span style={{fontSize:14,color:t.faint,cursor:"grab",flexShrink:0}}>⠿</span>
                  <span style={{flex:1,fontSize:13,color:t.text,fontFamily:f.body}}>{item.label}</span>
                  {item.required
                    ? <span style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace"}}>always</span>
                    : <button onClick={()=>setNavHidden(prev=>{const s=new Set(prev);hidden?s.delete(id):s.add(id);return s;})}
                        style={{background:hidden?"none":t.accent,border:`1px solid ${hidden?t.border:t.accent}`,borderRadius:4,width:32,height:18,cursor:"pointer",position:"relative",transition:"all 0.15s",flexShrink:0}}>
                        <span style={{position:"absolute",top:2,left:hidden?2:14,width:14,height:14,borderRadius:"50%",background:hidden?t.muted:"#fff",transition:"left 0.15s"}}/>
                      </button>}
                </div>
              );
            })}
            <button onClick={()=>{setNavOrder(ALL_NAV_ITEMS.map(n=>n.id));setNavHidden(new Set());}}
              style={{background:"none",border:`1px solid ${t.border}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace",marginTop:6,width:"100%"}}>
              Reset to default
            </button>
            <button onClick={()=>setEditingNav(false)}
              style={{background:t.accent,color:"#fff",border:"none",borderRadius:7,padding:"7px 10px",cursor:"pointer",fontSize:12,fontFamily:"'DM Mono',monospace",marginTop:6,width:"100%"}}>
              Done
            </button>
          </div>

        /* ── Normal nav ── */
        : <nav style={{flex:1,overflowY:"auto"}}>{navItems.map((item,idx)=>{
            const active=page===item.id||(page==="intern-profile"&&item.id==="interns");
            const isAI=item.id==="consult"||item.id==="lab";
            const rainbowColors=["#9B6FD4","#B880CC","#F4A0C0","#4DBDBD","#7AD4D4","#C88AC8","#F9C4DA","#4DBDBD","#9B6FD4","#B880CC","#F4A0C0","#4DBDBD","#7AD4D4","#C88AC8"];
            const rc = t.isRainbow ? rainbowColors[idx % rainbowColors.length] : null;
            const activeBg     = t.isRainbow ? `${rc}18` : t.isGradient ? (t.gradientSubtle||t.accentLight) : isAI ? t.accentMid : t.accentLight;
            const activeBorder = rc || t.accent;
            return <button key={item.id}
              onMouseEnter={()=>setNavHover(item.id)}
              onMouseLeave={()=>setNavHover(null)}
              onClick={()=>{setPage(item.id);setSelectedInternId_sv(null);setInternFilter(null);setConsultIntern(null);}}
              style={{width:"100%",background:active?activeBg:navHover===item.id?t.surfaceAlt:"none",border:"none",borderLeft:active?`3px solid ${activeBorder}`:"3px solid transparent",padding:"11px 24px",cursor:"pointer",textAlign:"left",fontSize:isAI?12:14,fontFamily:isAI?"'DM Mono',monospace":f.body,fontWeight:active?500:400,transition:"background 0.1s",display:"flex",alignItems:"center",gap:8}}>
              {t.isRainbow&&<div style={{width:7,height:7,borderRadius:"50%",background:rc,flexShrink:0,opacity:active?1:0.35}}/>}
              {t.isGradient&&<div style={{width:7,height:7,borderRadius:"50%",background:t.gradient,backgroundSize:"200% 200%",animation:"gradientShift 5s ease infinite",flexShrink:0,opacity:active?1:0.4}}/>}
              <span style={{display:"inline-block",...(t.isGradient&&active?{background:t.gradient,backgroundSize:"200% 200%",animation:"gradientShift 5s ease infinite",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}:{color:active?(rc||t.accent):isAI?t.accentText:t.text})}}>{item.label}</span>
            </button>;
          })}</nav>}

      {/* Controls: HC + dark mode — themes in Settings */}
      <div style={{padding:"12px 24px",borderTop:`1px solid ${t.borderLight}`}}>

        <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:6}}>
          <button onClick={()=>setHighContrast(h=>!h)} title={highContrast?"High contrast on":"High contrast off"}
            style={{background:highContrast?t.accent:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:6,padding:"2px 7px",cursor:"pointer",fontSize:10,color:highContrast?"#fff":t.faint,fontFamily:"'DM Mono',monospace",transition:"all 0.2s"}}>
            HC
          </button>
          <button onClick={()=>setDarkMode(d=>!d)} title={darkMode?"Light mode":"Dark mode"}
            style={{background:darkMode?t.accent:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:20,width:44,height:24,cursor:"pointer",position:"relative",transition:"background 0.2s",flexShrink:0}}>
            <span style={{position:"absolute",top:3,left:darkMode?22:2,width:18,height:18,borderRadius:"50%",background:darkMode?"#fff":t.muted,transition:"left 0.2s",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{darkMode?"🌙":"☀️"}</span>
          </button>
        </div>
      </div>

      {/* Intern portal */}
      <div style={{padding:"12px 24px",borderTop:`1px solid ${t.borderLight}`}}>
        <div style={{fontSize:10,color:t.faint,fontFamily:"'DM Mono',monospace",letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Intern portal</div>
        {interns.filter(i=>i.status==="active").map(i=><button key={i.id} onClick={()=>setPortalInternId(i.id)} style={{display:"flex",alignItems:"center",gap:7,width:"100%",background:"none",border:"none",cursor:"pointer",padding:"3px 0",color:t.muted,fontSize:12,fontFamily:"'DM Mono',monospace"}}>
          <Avatar initials={i.initials} size={18} T={t}/>{dn(i).split(" ")[0]}
        </button>)}
      </div>

      <div style={{padding:"12px 24px",borderTop:`1px solid ${t.borderLight}`}}>
        <div onClick={()=>setPage("profile")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",borderRadius:8,padding:"4px 0"}} title="My profile">
          <Avatar initials={supervisorInitials} size={32} T={t} photo={supervisorPhoto}/>
          <div>
            <div style={{fontSize:13,color:t.text,fontWeight:500}}>{supervisorName.split(" ")[0]}</div>
            <div style={{fontSize:11,color:t.muted,fontFamily:"'DM Mono',monospace"}}>Supervisor</div>
          </div>
        </div>
        {/* Admin inbox — only shown to account owner, subtle */}
        {isAdmin&&<button onClick={()=>setPage("admin")}
          style={{marginTop:8,background:"none",border:"none",cursor:"pointer",fontSize:10,color:page==="admin"?t.accent:t.faint,fontFamily:"'DM Mono',monospace",padding:0,display:"flex",alignItems:"center",gap:4}}>
          🔒 Admin inbox{tickets.filter(tk=>tk.status==="open").length>0&&<span style={{background:t.accent,color:"#fff",borderRadius:20,fontSize:9,padding:"1px 5px"}}>{tickets.filter(tk=>tk.status==="open").length}</span>}
        </button>}
      </div>
    </div>

    {/* Main content */}
    <div id="suptrack-content" style={{flex:1,padding:"38px 44px",maxWidth:980,overflowY:"auto"}}>
      {page==="dashboard"&&<Dashboard T={t} interns={interns} groups={groups} lists={lists} colleagues={colleagues} supervisorName={supervisorName}
        onAddIntern={()=>setAddInternOpen(true)}
        onQuickAction={setQuickActionOpen}
        onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}}
        onNavigate={navigate}
        onOpenOnboarding={()=>setOnboardingOpen(true)}
        quickActionOrder={quickActionOrder}
        quickActionHidden={quickActionHidden}
        allQuickActions={ALL_QUICK_ACTIONS}
        onQuickActionReorder={setQuickActionOrder}
        onQuickActionToggle={(id)=>{
          if(id==="__reset__"){ setQuickActionHidden(new Set(["loggroup","upload","agreements","onboard","payments_pg","groups"])); return; }
          setQuickActionHidden(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});
        }}
      />}
      {page==="intern-profile"&&!selectedIntern&&(()=>{setTimeout(()=>setPage("interns"),0);return null;})()}
      {page==="intern-profile"&&selectedIntern&&<InternProfile T={t} intern={selectedIntern} groups={groups} lists={lists} setLists={setLists} colleagues={colleagues} setColleagues={setColleagues} onBack={()=>{setSelectedInternId_sv(null);setPage("interns");}} onUpdateIntern={updateIntern} onDelete={(id)=>{setInterns(p=>p.filter(i=>i.id!==id));setSelectedInternId_sv(null);setPage("interns");}} onConsult={i=>{setConsultIntern(i);setPage("resources");}} onOpenLab={()=>setPage("lab")} onGroupClick={(gid)=>{setSelectedGroupId(gid);setPage("groups");}}/>}
      {page==="interns"&&<InterneesPage T={t} interns={interns} groups={groups} lists={lists} colleagues={colleagues} internFilter={internFilter} setInternFilter={setInternFilter} internSort={internSort} setInternSort={setInternSort} internViewMode={internViewMode} setInternViewMode={setInternViewMode} onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}} onGroupClick={(gid)=>{setSelectedGroupId(gid);setPage("groups");}} onAddIntern={()=>setAddInternOpen(true)} onOpenOnboarding={()=>setOnboardingOpen(true)}/>}
      {page==="groups"&&<GroupsPage T={t} groups={groups} interns={interns} colleagues={colleagues} setColleagues={setColleagues} setGroups={setGroups} initialGroupId={selectedGroupId} updateInterns={addSessionCharge} updateIntern={updateIntern} onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}}/>}

      {page==="payments"&&<PaymentsPage T={t} interns={interns} groups={groups} onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}}/>}
      {page==="billing"&&<BillingPage T={t} F={f} colleagues={colleagues} billing={billing} setBilling={setBilling} interns={interns}/>}
      {page==="ce"&&<CETrackerPage T={t} ceData={ceData} setCeData={setCeData}/>}
      {page==="calendar"&&<CalendarPage T={t}/>}
      {page==="resources"&&<ResourcesHubPage T={t} interns={interns} consultIntern={consultIntern}/>}
      {page==="resources"&&<ResourcesPage T={t}/>}
      {page==="discover"&&<DiscoverPage T={t} interns={interns} onAddIntern={newIntern=>setInterns(p=>[...p,newIntern])}/>}
      {page==="agreements"&&<AgreementsPage T={t} interns={interns} supervisorName={supervisorName}/>}

      {page==="support"&&<SupportPage T={t} supervisorName={supervisorName} supervisorEmail={`${(supervisorName||"Alyson K.").toLowerCase().replace(/[^a-z0-9]/g,".")}@questcounseling.org`} tickets={tickets} setTickets={setTickets}/>}
      {page==="reminders"&&<RemindersPanel T={t} interns={interns} groups={groups} onNavigate={(dest,ctx)=>{setPage(dest);if(ctx)setSelectedGroupId(ctx);}} onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}}/>}
      {page==="admin"&&isAdmin&&<AdminInboxPage T={t} tickets={tickets} setTickets={setTickets}/>}
      {page==="admin"&&!isAdmin&&<div style={{padding:40,color:t.muted,fontSize:14}}>Access restricted.</div>}
      {page==="profile"&&<PublicProfilePage T={t} supervisorPhoto={supervisorPhoto} setSupervisorPhoto={setSupervisorPhoto} supervisorName={supervisorName} setSupervisorName={setSupervisorName} supervisorInitials={supervisorInitials}/>}
      {page==="settings"&&<SettingsPage T={t} theme={theme} setTheme={setTheme} setCustomTheme={setCustomTheme} font={fontKey} setFont={setFontKey} darkMode={darkMode} setDarkMode={setDarkMode} highContrast={highContrast} setHighContrast={setHighContrast} supervisorName={supervisorName} setSupervisorName={setSupervisorName}/>}
      {!["dashboard","interns","intern-profile","groups","payments","billing","ce","calendar","consult","lab","resources","discover","agreements","reminders","support","admin","profile","settings"].includes(page)&&<Dashboard T={t} interns={interns} groups={groups} lists={lists} colleagues={colleagues} supervisorName={supervisorName} onAddIntern={()=>setAddInternOpen(true)} onQuickAction={setQuickActionOpen} onSelectIntern={i=>{setSelectedInternId_sv(i.id);setPage("intern-profile");}} onNavigate={navigate} onOpenOnboarding={()=>setOnboardingOpen(true)} quickActionOrder={quickActionOrder} quickActionHidden={quickActionHidden} allQuickActions={ALL_QUICK_ACTIONS} onQuickActionReorder={setQuickActionOrder} onQuickActionToggle={(id)=>{setQuickActionHidden(prev=>{const s=new Set(prev);s.has(id)?s.delete(id):s.add(id);return s;});}}/>}
      {quickActionOpen&&<QuickActionModal T={t} action={quickActionOpen} interns={interns} groups={groups} onUpdateIntern={updateIntern} onClose={()=>setQuickActionOpen(null)}/>}
      {onboardingOpen&&<OnboardingModal T={t} supervisorName={supervisorName} onClose={()=>setOnboardingOpen(false)}/>}
      {addInternOpen&&<AddInternModal T={t} groups={groups} lists={lists}
        onSave={newIntern=>setInterns(p=>[...p,newIntern])}
        onClose={()=>setAddInternOpen(false)}
        onSendLink={()=>{setAddInternOpen(false);setOnboardingOpen(true);}}
      />}
    </div>
  </div>;
}
export default function SupTrack(){return <ErrorBoundary><SupTrackInner/></ErrorBoundary>;}
