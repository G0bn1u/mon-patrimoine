"use client";

import { useState } from "react";
import { Card, Text, Metric, AreaChart, DonutChart, Grid, Flex, ProgressBar, Title } from "@tremor/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const netWorthHistory = [
  { date: "Jan", Patrimoine: 21500 },
  { date: "Fév", Patrimoine: 21800 },
  { date: "Mar", Patrimoine: 22100 },
  { date: "Avr", Patrimoine: 22390.99 },
];

const assetAllocation = [
  { name: "Sécurité (Livrets)", value: 4323.39 },
  { name: "Immobilier (PEL)", value: 12810.31 },
  { name: "Bourse (AV Vivaccio)", value: 5257.29 },
];

export default function DashboardPage() {
  const [privacyMode, setPrivacyMode] = useState(false);

  const formatValue = (number: number) => {
    if (privacyMode) return "**** €";
    return `${Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(number)} €`;
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-50 font-sans pb-12">
      <header className="bg-slate-900 border-b border-slate-800 px-8 py-4 mb-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white">FINANCIAL <span className="font-light text-slate-400">Wealth OS</span></div>
          <button 
            onClick={() => setPrivacyMode(!privacyMode)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
          >
            {privacyMode ? <EyeSlashIcon className="h-6 w-6" /> : <EyeIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <main className="px-8 max-w-6xl mx-auto space-y-8">
        <section>
          <Text className="text-slate-400 font-medium mb-1">Patrimoine Net Total</Text>
          <Flex justifyContent="start" alignItems="baseline" className="space-x-4">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">
              {formatValue(22390.99)}
            </h1>
          </Flex>
        </section>

        <Grid numItemsSm={1} numItemsLg={3} className="gap-6">
          <Card className="col-span-1 lg:col-span-2 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
            <Title className="text-white mb-4">Évolution du patrimoine</Title>
            <AreaChart
              className="h-72"
              data={netWorthHistory}
              index="date"
              categories={["Patrimoine"]}
              colors={["blue"]}
              valueFormatter={(val) => privacyMode ? "****" : `${val} €`}
              showLegend={false}
              showGridLines={false}
              showYAxis={false}
            />
          </Card>

          <Card className="col-span-1 rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
            <Title className="text-white mb-4">Répartition d'actifs</Title>
            <DonutChart
              className="h-52"
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

        <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
          <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
            <Title className="text-white mb-2">Score de Diversification</Title>
            <Text className="text-slate-400 mb-4">Profil Risque 3/7 (Équilibré/Prudent)</Text>
            <Flex>
              <Text className="text-white font-bold">6.5 / 10</Text>
              <Text className="text-slate-400">Objectif: Lisser le PEA</Text>
            </Flex>
            <ProgressBar value={65} color="blue" className="mt-4" />
          </Card>

          <Card className="rounded-2xl ring-1 ring-slate-800 shadow-lg border-0 bg-slate-900">
            <Title className="text-white mb-2">Reste à vivre mensuel</Title>
            <Text className="text-slate-400 mb-4">Revenus : 1 732.41 €</Text>
            <Metric className="text-white">{formatValue(1732.41 - 635.20 - 200)}</Metric>
            <Text className="mt-4 text-sm text-slate-400">Après Loyer (635.20 €) et DCA (200 €)</Text>
          </Card>
        </Grid>
      </main>
    </div>
  );
}
