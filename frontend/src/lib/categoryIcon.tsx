import {
  Wrench, Zap, PaintRoller, Sparkles, Hammer, HardHat, Flame, Key,
  Trees, Truck, Wind, Shield, Square, Home, Layers, Bug, Sofa, Cpu,
  ShieldCheck, Droplet, Thermometer, Palette, SquareStack, Settings,
  Sun, Printer
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'wrench':       Wrench,
  'zap':          Zap,
  'paint-roller': PaintRoller,
  'sparkles':     Sparkles,
  'hammer':       Hammer,
  'hard-hat':     HardHat,
  'flame':        Flame,
  'key':          Key,
  'trees':        Trees,
  'truck':        Truck,
  'wind':         Wind,
  'shield':       Shield,
  'square':       Square,
  'home':         Home,
  'layers':       Layers,
  'bug':          Bug,
  'sofa':         Sofa,
  'cpu':          Cpu,
  'shield-check': ShieldCheck,
  'droplet':      Droplet,
  'thermometer':  Thermometer,
  'palette':      Palette,
  'square-stack': SquareStack,
  'settings':     Settings,
  'sun':          Sun,
  'printer':      Printer,
};

export function CategoryIcon({ name, className = "h-3 w-3 inline-block align-middle mr-1" }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}
