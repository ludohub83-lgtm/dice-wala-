import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function GET() {
  try {
    const appConfigRef = doc(db, 'admin', 'appConfig');
    const docSnap = await getDoc(appConfigRef);
    
    if (docSnap.exists()) {
      return NextResponse.json(docSnap.data());
    } else {
      // Return default values if document doesn't exist
      return NextResponse.json({ 
        ai_difficulty: 'normal', 
        game_difficulty: 'normal', 
        entry_fee_coin: 0, 
        daily_bonus_coin: 0, 
        bot_fill_ratio: 0 
      });
    }
  } catch (e) {
    console.error('Error loading config:', e);
    return NextResponse.json({ error: e.message || 'Failed to load config' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const ai_difficulty = body.ai_difficulty || 'normal';
    const entry_fee_coin = Number(body.entry_fee_coin || 0);
    const daily_bonus_coin = Number(body.daily_bonus_coin || 0);
    const bot_fill_ratio = Number(body.bot_fill_ratio || 0);
    const game_difficulty = body.game_difficulty || ai_difficulty;

    const configData = {
      ai_difficulty,
      entry_fee_coin,
      daily_bonus_coin,
      bot_fill_ratio,
      game_difficulty,
      updatedAt: serverTimestamp(),
    };
    
    const appConfigRef = doc(db, 'admin', 'appConfig');
    await setDoc(appConfigRef, configData, { merge: true });
    
    return NextResponse.json({
      ...configData,
      updatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Error saving config:', e);
    return NextResponse.json({ error: e.message || 'Failed to save config' }, { status: 500 });
  }
}
