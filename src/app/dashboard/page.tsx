"use client";

/* TAILWIND V4 SAFELIST - Ruse de Senior
  bg-blue-500 text-blue-500 fill-blue-500 ring-blue-500 stroke-blue-500
  bg-emerald-500 text-emerald-500 fill-emerald-500 ring-emerald-500 stroke-emerald-500
  bg-amber-500 text-amber-500 fill-amber-500 ring-amber-500 stroke-amber-500
  bg-indigo-500 text-indigo-500 fill-indigo-500 ring-indigo-500 stroke-indigo-500
*/

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Card, Text, AreaChart, DonutChart, Grid, Flex, ProgressBar, Title,
  Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Callout, Divider
} from "@tremor/react";
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Data States
  const [familyAdvances, setFamilyAdvances] = useState<any[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<any[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<any[]>([]);
  
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ description: "", amount: "", date: "", status: "En attente" });
  
  // Simulator States
  const [monthlyInvestment, setMonthlyInvestment] = useState(200);
  const [expectedReturn, setExpectedReturn] = useState(5);
  const [duration, setDuration] = useState(20);
  
  const currentCCPBalance = 2450.00;

  async function fetchData() {
    const [advancesRes, historyRes, assetsRes] = await Promise.all([
      supabase.from('family_advances').select('*').order('id', { ascending: false }),
      supabase.from('net_worth_history').select('*').order('id', { ascending: true }),
      supabase.from('assets').select('*').order('id', { ascending: true })
    ]);
    
    if (advancesRes.data) setFamilyAdvances(advancesRes.data);
    if (historyRes.data) setNetWorthHistory(historyRes.data);
    if (assetsRes.data) setAssetAllocation(assetsRes.data);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const { error } = await supabase.from('family_advances').insert([
      { description: formData.description, amount: parseFloat(formData.amount), date: formData.date, status: formData.status }
    ]);
    if (!error) {
      setFormData({ description: "", amount: "", date: "", status: "En attente" });
      await fetchData();
    }
    setIsSubmitting(false);
  };

  // Logique du Simulateur d'intérêts composés
  const projectionData = useMemo(() => {
    let data = [];
    let currentCapital = 0;
    const annualRate = expectedReturn / 100;

    for (let year = 0; year <= duration; year++) {
      if (year > 0) {
        currentCapital = currentCapital * (1 + annualRate) + (monthlyInvestment * 12);
      }
      data.push({
        year: `A${year}`,
        Capital: Math.round(currentCapital)
      });
    }
    return data;
  }, [monthlyInvestment, expectedReturn, duration]);

  const totalNetWorth = assetAllocation.reduce((acc, curr) => acc + Number(curr.value), 0);

  const formatValue = (number: number) => {
    if (privacyMode) return "**** €";
    return `${Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(number)} €`;
  };

  const tabs = ["Vue d'ensemble", "Optimisation", "Budget & Avances", "Simulateur PEA"];

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-50 font-sans pb-12">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white">FINANCIAL <span className="font-light text-slate-400">Wealth OS</span></div>
          <button onClick={() => setPrivacyMode(!privacyMode)} className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
            {privacyMode ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <main className="px-8 max-w-6xl mx-auto space-y-8">
        <section>
          <Text className="text-slate-400 font-medium mb-1">Patrimoine Net Total</Text>
          <Flex justifyContent="start" alignItems="baseline" className="space-x-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">{formatValue(totalNetWorth)}</h1>
          </Flex>
        </section>

        <div className="border-b border-slate-800 flex space-x-6 mb-6">
          {tabs.map((tab, index) => (
            <button key={index} onClick={() => setActiveTab(index)} className={`pb-3 text-sm font-medium transition-colors ${activeTab === index ? "border-b-2 border-blue-500 text-blue-500" : "text-slate-400 hover:text-slate-200"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ONGLETS 1, 2 ET 3 INCHANGÉS */}
        {activeTab === 0 && (
          <Grid numItemsSm={1} numItemsLg={3} className="gap-6 animate-in fade-in duration-300">
            <Card className="col-span-1 lg:col-span-2 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Évolution du patrimoine</Title>
              <AreaChart className="h-72 mt-4" data={netWorthHistory} index="date" categories={["patrimoine"]} colors={["blue"]} valueFormatter={(val) => privacyMode ? "****" : `${val} €`} showLegend={false} showGridLines={true} showYAxis={true} yAxisWidth={60} />
            </Card>
            <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Répartition d'actifs</Title>
              <DonutChart className="h-52 mt-6" data={assetAllocation} category="value" index="name" valueFormatter={(val) => privacyMode ? "****" : `${val} €`} colors={["emerald", "amber", "indigo"]} showLabel={true} variant="pie" />
            </Card>
          </Grid>
        )}

        {activeTab === 1 && (
          <Grid numItemsSm={1} numItemsLg={2} className="gap-6 animate-in fade-in duration-300">
            <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Alerte Liquidités (CCP)</Title>
              {currentCCPBalance > 2000 ? (
                <Callout title="Argent qui dort détecté" icon={ExclamationTriangleIcon} color="amber">Votre compte courant dépasse les 2 000 €. Vous avez {formatValue(currentCCPBalance - 2000)} à allouer.</Callout>
              ) : (
                <Callout title="Liquidités optimisées" icon={CheckCircleIcon} color="emerald">Votre compte courant est sous le seuil d'alerte.</Callout>
              )}
            </Card>
            <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Objectif LEP</Title>
              <Text className="text-slate-400 mb-2">Plafond : 10 000 €</Text>
              <ProgressBar value={0} color="emerald" className="mt-2" />
            </Card>
          </Grid>
        )}

        {activeTab === 2 && (
          <Grid numItemsSm={1} numItemsLg={3} className="gap-6 animate-in fade-in duration-300">
            <Card className="col-span-1 lg:col-span-2 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Module Avances Famille</Title>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeaderCell className="text-slate-400">Description</TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">Date</TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">Montant</TableHeaderCell>
                    <TableHeaderCell className="text-slate-400">Statut</TableHeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familyAdvances.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-white">{item.description}</TableCell>
                      <TableCell className="text-slate-400">{item.date}</TableCell>
                      <TableCell className="text-white font-medium">{formatValue(item.amount)}</TableCell>
                      <TableCell><Badge color={item.status === "Remboursé" ? "emerald" : "amber"}>{item.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Nouvelle avance</Title>
              <form onSubmit={handleAddAdvance} className="space-y-4">
                <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Description" />
                <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Montant (€)" />
                <input required type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Date" />
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="En attente">En attente</option>
                  <option value="Remboursé">Remboursé</option>
                </select>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  {isSubmitting ? "Ajout..." : "Ajouter"}
                </button>
              </form>
            </Card>
          </Grid>
        )}

        {/* NOUVEAU SIMULATEUR DYNAMIQUE */}
        {activeTab === 3 && (
          <Grid numItemsSm={1} numItemsLg={3} className="gap-6 animate-in fade-in duration-300">
            <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-6">Paramètres de simulation</Title>
              <div className="space-y-6">
                <div>
                  <Flex justifyContent="between" className="mb-2">
                    <label className="text-sm font-medium text-slate-400">Investissement mensuel</label>
                    <Text className="text-white font-bold">{monthlyInvestment} €</Text>
                  </Flex>
                  <input type="range" min="50" max="2000" step="50" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="w-full accent-indigo-500" />
                </div>
                
                <Divider className="my-4" />
                
                <div>
                  <Flex justifyContent="between" className="mb-2">
                    <label className="text-sm font-medium text-slate-400">Rendement annuel estimé</label>
                    <Text className="text-emerald-400 font-bold">{expectedReturn} %</Text>
                  </Flex>
                  <input type="range" min="1" max="15" step="0.5" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full accent-emerald-500" />
                </div>

                <Divider className="my-4" />

                <div>
                  <Flex justifyContent="between" className="mb-2">
                    <label className="text-sm font-medium text-slate-400">Durée (Années)</label>
                    <Text className="text-white font-bold">{duration} ans</Text>
                  </Flex>
                  <input type="range" min="5" max="40" step="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-blue-500" />
                </div>

                <div className="pt-4 mt-6 border-t border-slate-800">
                  <Text className="text-slate-400 text-sm mb-1">Capital final estimé</Text>
                  <Text className="text-3xl font-bold text-white">
                    {formatValue(projectionData[projectionData.length - 1]?.Capital || 0)}
                  </Text>
                </div>
              </div>
            </Card>

            <Card className="col-span-1 lg:col-span-2 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-2">Projection de la magie des intérêts composés</Title>
              <Text className="text-slate-400 mb-6">Basé sur une stratégie d'investissement programmé (DCA)</Text>
              <AreaChart
                className="h-[400px]"
                data={projectionData}
                index="year"
                categories={["Capital"]}
                colors={["indigo"]}
                valueFormatter={(val) => privacyMode ? "****" : `${val} €`}
                showGridLines={true}
                yAxisWidth={80}
              />
            </Card>
          </Grid>
        )}
      </main>
    </div>
  );
}
