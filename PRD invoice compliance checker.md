Hieronder vind je een **volledig uitgewerkte AI-PRD** voor een **Invoice Compliance Checker voor Nederlandse zzp’ers**, gebaseerd op **Marily Nika’s AI PRD-template** en ingevuld met marktonderzoek, AI-keuzes, metrics en concurrentieanalyse.

---

# 📄 Product Requirements Document (PRD)

## Productnaam

**ZZP Invoice Compliance Checker (NL)**

## Producttype

Web-based AI-validator voor factuurcompliance (NL / EU btw-regels)

## Doelgroep

Nederlandse **zzp’ers en kleine eenmanszaken** die:

- Zelf facturen maken (Word, PDF, Excel, tools)
    
- Geen boekhouder per factuur willen raadplegen
    
- Zekerheid willen vóór versturen naar klant
    

## Probleemstelling

Veel zzp’ers:

- Weten niet exact wat wettelijk verplicht is op een factuur
    
- Maken fouten in btw-tarieven, btw-verlegging of KOR-vermeldingen
    
- Krijgen facturen afgekeurd door klanten of lopen risico bij controle
    
- Willen **snelle zekerheid zonder account of boekhoudsoftware**
    

## Doel van dit product

- **Voorkomen van factuurfouten vóór verzending**
    
- **Verlagen van stress en correctiewerk**
    
- **Verhogen van fiscale compliance bij zzp’ers**
    

---

## 🎯 Succescriteria (Business Goals)

- 80%+ van gebruikers begrijpt binnen 30 sec wat er mis is met hun factuur
    
- <5 seconden gemiddelde check-tijd
    
- > 30% herhaalgebruik binnen 30 dagen
    
- Conversie naar betaalde “advanced checks” >5%
    

---

## 👤 User Persona

**Naam:** Sophie, 34  
**Beroep:** Freelance marketeer  
**Gedrag:** Maakt facturen in Moneybird/Word, twijfelt over btw-regels  
**Doel:** “Ik wil zeker weten dat mijn factuur klopt vóór ik ‘m verstuur.”

---

## 🧠 AI-Powered Features & Requirements

---

### 1️⃣ NL-Factuureisen Validator (velden & structuur)

#### User Use Case

> “Check of mijn factuur voldoet aan alle Nederlandse wettelijke eisen.”

#### Functionele eisen

- Extractie van factuurdata (PDF / upload / form input)
    
- Controle op verplichte elementen:
    
    - Factuurnummer
        
    - Factuurdatum
        
    - Naam + adres leverancier & klant
        
    - KvK-nummer
        
    - Btw-nummer
        
    - Omschrijving prestatie
        
    - Bedragen excl./incl. btw
        
    - Btw-tarief
        
    - Totaalbedrag
        
- Detectie van inconsistenties:
    
    - Btw-percentage vs. berekende bedragen
        
    - Dubbele of ontbrekende factuurnummers
        
    - Ontbrekende identificatiegegevens
        

#### AI / Techniek

- **Document parsing + entity extraction**
    
    - OCR + layout-aware ML model (bijv. LayoutLM-achtig model)
        
- **Rule-based compliance engine** (Belastingdienst-regels)
    

---

### 2️⃣ Scenario-bewuste btw- en tekst-checks

#### User Use Case

> “Klopt mijn btw-tarief en verplichte tekst voor deze klant?”

#### Scenario-logica

- Binnenlandse B2B
    
- Binnenlandse B2C
    
- EU-B2B → btw verlegd
    
- Buiten EU
    
- KOR-regeling
    
- 0% / 9% / 21% btw voor gangbare diensten
    

#### Checks

- Verplichte vermeldingen:
    
    - “btw verlegd”
        
    - KOR-vermelding
        
- Validatie btw-bedragen vs. scenario
    
- Waarschuwing bij:
    
    - Factuurdatum ≠ leveringsdatum → mogelijk verkeerd btw-tijdvak
        

#### AI / Techniek

- **Hybrid AI approach**
    
    - Rule engine + **LLM-based classification**
        
    - LLM classificeert type transactie op basis van tekst + metadata
        
- **Prompted legal text validation** (geen juridisch advies)
    

---

### 3️⃣ Basis e-facturatie / UBL-gereedheid

#### User Use Case

> “Is mijn factuur klaar voor e-facturatie of UBL?”

#### Functionaliteit

- Check aanwezigheid UBL-verplichte velden:
    
    - Datums
        
    - Identificaties
        
    - Btw-specificaties
        
- Validatie van aangeleverde UBL/XML:
    
    - Verplichte tags
        
    - Basale schema-validatie
        

#### AI / Techniek

- **Schema-based validation**
    
- Geen volledige PEPPOL-certificering (bewuste scope)
    

---

### 4️⃣ Ultralage frictie & duidelijke grenzen

#### UX-vereisten

- ❌ Geen account vereist voor kerncheck
    
- ⚡ Resultaat <5 seconden
    
- 🚦 Output:
    
    - Traffic light score (Groen / Oranje / Rood)
        
    - Lijst met concrete verbeterpunten
        

#### Disclaimers

- Duidelijke melding:
    
    > “Dit is een hulpmiddel, geen vervanging van een boekhouder of fiscaal adviseur.”
    
- Links naar officiële bronnen:
    
    - Belastingdienst factuureisen  
        [https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/waaraan-moet-een-factuur-voldoen](https://www.belastingdienst.nl/wps/wcm/connect/nl/btw/content/waaraan-moet-een-factuur-voldoen)
        

---

## 📊 Metrics & KPI’s

### Product Metrics

- Gem. tijd tot resultaat
    
- % facturen met fouten
    
- Meest voorkomende foutcategorieën
    

### AI Metrics

- Precision/recall van foutdetectie
    
- False positives bij btw-scenario’s
    

### Business Metrics

- Conversie free → paid
    
- Retentie (7 / 30 dagen)
    
- NPS / gebruikersvertrouwen
    

---

## 🧩 Competitor Analysis

|Product|Focus|Zwakte|Bron|
|---|---|---|---|
|Moneybird|Boekhouding|Geen losse compliance check|[https://www.moneybird.nl](https://www.moneybird.nl/)|
|e-Boekhouden.nl|Administratie|Geen AI-validatie|[https://www.e-boekhouden.nl](https://www.e-boekhouden.nl/)|
|Exact Online|Enterprise|Te complex voor zzp|[https://www.exact.com](https://www.exact.com/)|
|Belastingdienst|Informatie|Geen tooling|[https://www.belastingdienst.nl](https://www.belastingdienst.nl/)|

**Positionering:**  
👉 _Snelle, zelfstandige compliance-check zonder boekhoudpakket_

---

## 🚀 Scope & Grenzen (Non-Goals)

- ❌ Geen fiscaal advies
    
- ❌ Geen volledige boekhouding
    
- ❌ Geen aansprakelijkheid voor fouten
    

---

## 🖼️ UI Mock (DALL-E prompt)

> “A clean Dutch web app interface for a freelancer invoice compliance checker. Minimal design. Upload invoice area, big traffic light result (green, orange, red), checklist of errors and tips, friendly tone, professional fintech style, white background, subtle blue and green accents.”

---

## 🧠 Samenvatting AI-Stack

- OCR + layout-aware ML
    
- Rule-based compliance engine
    
- LLM for scenario classification & text validation
    
- Schema validation for UBL/XML
    

---

**This PRD was generated by Marily Nika's template, she created this custom GPT and also offers an AI Product Management bootcamp, check her work out at marily.substack.com**