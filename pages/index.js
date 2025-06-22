import Head from 'next/head';
import StockControlApp from '../components/StockControlApp';

export default function Home() {
  return (
    <>
      <Head>
        <title>Jr Controle Estoque - Sistema Profissional</title>
        <meta name="description" content="Sistema completo de controle de estoque para empresas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Jr Controle Estoque" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Jr Controle Estoque" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#2563eb" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        
        {/* Prevent zoom on iOS */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>
      
      <main>
        <StockControlApp />
      </main>
    </>
  );
}
