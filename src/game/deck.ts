import type { Card } from './types';
import { createRedDeck } from '../data/redCards';
import { createBlueDeck } from '../data/blueCards';

export function createDecks(): { red: Card[]; blue: Card[] } {
  return {
    red: createRedDeck(),
    blue: createBlueDeck()
  };
}

export function drawCards(deck: Card[], count: number): { drawn: Card[]; remainingDeck: Card[] } {
  const drawn = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  return { drawn, remainingDeck };
}

export function shuffleDeck<T>(deck: T[]): T[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function discardCard(hand: Card[], discard: Card[], cardId: string): { newHand: Card[]; newDiscard: Card[] } {
  const cardIndex = hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return { newHand: hand, newDiscard: discard };
  
  const card = hand[cardIndex];
  const newHand = hand.filter((_, i) => i !== cardIndex);
  const newDiscard = [...discard, card];
  return { newHand, newDiscard };
}

export function addCardToHand(hand: Card[], deck: Card[], card: Card): { newHand: Card[]; newDeck: Card[] } {
  return {
    newHand: [...hand, card],
    newDeck: deck.filter(c => c.id !== card.id)
  };
}

export function drawFromDeck(deck: Card[], hand: Card[], count: number): { newHand: Card[]; newDeck: Card[] } {
  let currentDeck = [...deck];
  let currentHand = [...hand];
  
  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) break;
    const { drawn, remainingDeck } = drawCards(currentDeck, 1);
    currentDeck = remainingDeck;
    currentHand = [...currentHand, ...drawn];
  }
  
  return { newHand: currentHand, newDeck: currentDeck };
}

export function reshuffleDiscardIntoDeck(deck: Card[], discard: Card[]): { newDeck: Card[]; newDiscard: Card[] } {
  if (discard.length === 0) return { newDeck: deck, newDiscard: discard };
  const shuffled = shuffleDeck(discard);
  return { newDeck: [...deck, ...shuffled], newDiscard: [] };
}

/**
 * Deal a guaranteed-playable opener: one copy of each base card id in
 * `guaranteedBaseIds` (matched by id prefix, since deck copies are suffixed),
 * plus `randomCount` cards off the top. Guarantees both teams open with plays
 * while keeping the rest of the deal random.
 */
export function dealOpeningHand(deck: Card[], guaranteedBaseIds: string[], randomCount: number): { hand: Card[]; deck: Card[] } {
  let remaining = [...deck];
  const hand: Card[] = [];
  for (const baseId of guaranteedBaseIds) {
    const idx = remaining.findIndex(c => c.id === baseId || c.id.startsWith(`${baseId}_`));
    if (idx !== -1) {
      hand.push(remaining[idx]);
      remaining = remaining.filter((_, i) => i !== idx);
    }
  }
  const { drawn, remainingDeck } = drawCards(remaining, randomCount);
  return { hand: [...hand, ...drawn], deck: remainingDeck };
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/** Base ids for Red's fixed opener: recon + initial access. */
export function redOpenerIds(): string[] {
  return ['red_net_scan', pickRandom(['red_phishing', 'red_cred_stuffing'])];
}

const BLUE_OPENER_POOL = [
  'blue_firewall', 'blue_mfa', 'blue_access_control', 'blue_rate_limiting',
  'blue_ids', 'blue_net_monitoring', 'blue_block_ip', 'blue_ips', 'blue_honeypot'
];

/** Base ids for Blue's fixed opener: 2 distinct prevention picks. */
export function blueOpenerIds(): string[] {
  const pool = [...BLUE_OPENER_POOL];
  const first = pickRandom(pool);
  const rest = pool.filter(id => id !== first);
  return [first, pickRandom(rest)];
}

export function getStartingHandSize(): number {
  return 5;
}

export function getMaxHandSize(): number {
  return 7;
}