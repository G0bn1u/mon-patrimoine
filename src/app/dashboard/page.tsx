"use client";

/* TAILWIND V4 SAFELIST - Ruse de Senior
  On force la compilation des couleurs pour les graphiques Tremor :
  bg-blue-500 text-blue-500 fill-blue-500 ring-blue-500 stroke-blue-500
  bg-emerald-500 text-emerald-500 fill-emerald-500 ring-emerald-500 stroke-emerald-500
  bg-amber-500 text-amber-500 fill-amber-500 ring-amber-500 stroke-amber-500
  bg-indigo-500 text-indigo-500 fill-indigo-500 ring-indigo-500 stroke-indigo-500
*/

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Card, Text, Metric, AreaChart, DonutChart, Grid, Flex, ProgressBar, Title,
  Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge, Callout
} from "@tremor/react";
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const projectionData = [
  { year: "Année 0", Capital: 0 },
  { year: "Année 5", Capital: 13600 },
  { year: "Année 10", Capital: 31000 },
  { year: "Année 15", Capital: 53200 },
  { year: "Année 20", Capital: 81500 },
];

export default function DashboardPage() {
  const [privacyMode, setPrivacyMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [familyAdvances, setFamilyAdvances] = useState<any[]>([]);
  const [netWorthHistory, setNetWorthHistory] = useState<any[]>([]);
  const [assetAllocation, setAssetAllocation] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ description: "", amount: "", date: "", status: "En attente" });
  
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

  const totalNetWorth = assetAllocation.reduce((acc, curr) => acc + Number(curr.value), 0);

  const formatValue = (number: number) => {
    if (privacyMode) return "**** €";
    return `${Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(number)} €`;
  };

  const tabs = ["Vue d'ensemble", "Optimisation", "Budget & Avances", "Simulateur 3/7"];

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

        {activeTab === 0 && (
          <Grid numItemsSm={1} numItemsLg={3} className="gap-6 animate-in fade-in duration-300">
            <Card className="col-span-1 lg:col-span-2 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Évolution du patrimoine</Title>
              <AreaChart
                className="h-72 mt-4"
                data={netWorthHistory}
                index="date"
                categories={["patrimoine"]}
                colors={["blue"]}
                valueFormatter={(val) => privacyMode ? "****" : `${val} €`}
                showLegend={false}
                showGridLines={true}
                showYAxis={true}
                yAxisWidth={60}
              />
            </Card>
            <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Répartition d'actifs</Title>
              <DonutChart
                className="h-52 mt-6"
                data={assetAllocation}
                category="value"
                index="name"
                valueFormatter={(val) => privacyMode ? "****" : `${val} €`}
                colors={["emerald", "amber", "indigo"]}
                showLabel={true}
                variant="pie"
              />
            </Card>
          </Grid>
        )}

        {/* RESTE DES ONGLETS IDENTIQUES */}
        {activeTab === 1 && (
          <Grid numItemsSm={1} numItemsLg={2} className="gap-6 animate-in fade-in duration-300">
            <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Alerte Liquidités (CCP)</Title>
              {currentCCPBalance > 2000 ? (
                <Callout title="Argent qui dort détecté" icon={ExclamationTriangleIcon} color="amber">
                  Votre compte courant dépasse les 2 000 €. Vous avez {formatValue(currentCCPBalance - 2000)} à allouer.
                </Callout>
              ) : (
                <Callout title="Liquidités optimisées" icon={CheckCircleIcon} color="emerald">
                  Votre compte courant est sous le seuil d'alerte.
                </Callout>
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
                      <TableCell>
                        <Badge color={item.status === "Remboursé" ? "emerald" : "amber"}>{item.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
              <Title className="text-white mb-4">Nouvelle avance</Title>
              <form onSubmit={handleAddAdvance} className="space-y-4">
                <div>
                  <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Description" />
                </div>
                <div>
                  <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Montant (€)" />
                </div>
                <div>
                  <input required type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" placeholder="Date" />
                </div>
                <div>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                    <option value="En attente">En attente</option>
                    <option value="Remboursé">Remboursé</option>
                  </select>
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm">
                  {isSubmitting ? "Ajout..." : "Ajouter"}
                </button>
              </form>
            </Card>
          </Grid>
        )}

        {activeTab === 3 && (
          <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900 animate-in fade-in duration-300">
            <Title className="text-white mb-2">Projection DCA PEA</Title>
            <AreaChart
              className="h-80 mt-4"
              data={projectionData}
              index="year"
              categories={["Capital"]}
              colors={["indigo"]}
              valueFormatter={(val) => privacyMode ? "****" : `${val} €`}
              showGridLines={true}
              yAxisWidth={60}
            />
          </Card>
        )}
      </main>
    </div>
  );
}
