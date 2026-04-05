import { NextResponse } from 'next/server';
import { plaidClient } from '@/lib/plaid';
import { CountryCode, Products } from 'plaid';

export async function POST() {
  try {
    const request = {
      user: { client_user_id: 'wealth-os-user-1' },
      client_name: 'Wealth OS',
      products: [Products.Transactions],
      // On repasse sur la France !
      country_codes: [CountryCode.Fr], 
      language: 'fr',
      // REMPLACE CETTE URL par ton vrai lien Vercel (indispensable pour l'Europe)
      redirect_uri: 'https://mon-patrimoine-wheat.vercel.app/dashboard',
    };

    const response = await plaidClient.linkTokenCreate(request);
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("ERREUR API:", error.response?.data || error.message);
    return NextResponse.json({ error: "Erreur serveur Plaid" }, { status: 500 });
  }
}
