import { LayoutDashboard, MapPin, Link2, Clock, BarChart2, TrendingUp, Camera, Car, Navigation } from 'lucide-react';

export const features = [
  { id: 'command_center', label: 'Command Center', shortLabel: 'Overview', icon: LayoutDashboard, shortcut: '0' },
  { id: 'hotspot', label: 'High-Traffic Areas Map', shortLabel: 'Map', icon: MapPin, shortcut: '1' },
  { id: 'correlation', label: 'Traffic & Parking Issues', shortLabel: 'Issues', icon: Link2, shortcut: '2' },
  { id: 'enforcement_gap', label: 'Missed Ticketing Spots', shortLabel: 'Ticketing', icon: Clock, shortcut: '3' },
  { id: 'pressure_score', label: 'Parking Difficulty Score', shortLabel: 'Pressure', icon: BarChart2, shortcut: '4', alertKey: 'pressure_score' },
  { id: 'prediction', label: 'Tomorrow\'s Predictions', shortLabel: 'Predictions', icon: TrendingUp, shortcut: '5' },
  { id: 'hardware_health', label: 'Camera Status Check', shortLabel: 'Cameras', icon: Camera, shortcut: '6', alertKey: 'hardware_health' },
  { id: 'offender', label: 'Repeat Offenders', shortLabel: 'Offenders', icon: Car, shortcut: '7', alertKey: 'offender' },
  { id: 'junction_gap', label: 'Camera Blind Spots', shortLabel: 'Blind Spots', icon: Navigation, shortcut: '8' }
];
