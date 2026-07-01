import React from 'react';
import {
  FolderKanban, Briefcase, Code, Globe, Zap, Target, Star, Rocket,
  Monitor, Database, Layout, Smartphone, Box, Cloud, Cpu, Layers,
  Activity, AlarmClock, Anchor, Award, Battery, Bell, BookOpen,
  Building, Camera, Car, Coffee, Compass, Crown, Diamond, Droplets,
  Feather, Flag, Flame, Gamepad, Gift, Headphones, Heart, Image,
  Key, Leaf, Lightbulb, Map, Microscope, Music, Package, Palette,
  PieChart, Puzzle, Radio, Scissors, Shield, ShoppingBag, Speaker,
  Sun, Tent, Tool, Trophy, Truck, Umbrella, Video, Wand
} from 'lucide-react';
import { FormField } from './UI';

export const ICON_MAP: Record<string, any> = {
  FolderKanban, Briefcase, Code, Globe, Zap, Target, Star, Rocket,
  Monitor, Database, Layout, Smartphone, Box, Cloud, Cpu, Layers,
  Activity, AlarmClock, Anchor, Award, Battery, Bell, BookOpen,
  Building, Camera, Car, Coffee, Compass, Crown, Diamond, Droplets,
  Feather, Flag, Flame, Gamepad, Gift, Headphones, Heart, Image,
  Key, Leaf, Lightbulb, Map, Microscope, Music, Package, Palette,
  PieChart, Puzzle, Radio, Scissors, Shield, ShoppingBag, Speaker,
  Sun, Tent, Tool, Trophy, Truck, Umbrella, Video, Wand
};

export const PRESET_ICONS = Object.keys(ICON_MAP);

const PRESET_COLORS = [
  { name: 'Xanh dương', value: '#3b82f6' },
  { name: 'Đỏ', value: '#ef4444' },
  { name: 'Xanh ngọc', value: '#10b981' },
  { name: 'Vàng', value: '#f59e0b' },
  { name: 'Tím', value: '#8b5cf6' },
  { name: 'Hồng', value: '#ec4899' },
  { name: 'Xanh dương nhạt', value: '#06b6d4' },
  { name: 'Cam', value: '#f97316' }
];

interface ProjectIconPickerProps {
  icon: string;
  color: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
}

export const DynamicIcon = ({ name, color = "#000", size = 20 }: { name: string, color?: string, size?: number }) => {
  const IconComponent = ICON_MAP[name] || ICON_MAP['FolderKanban'];
  return <IconComponent color={color} size={size} />;
};

export const ProjectIconPicker: React.FC<ProjectIconPickerProps> = ({ icon, color, onIconChange, onColorChange }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <FormField label="Chọn Biểu tượng (Icon)">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_ICONS.map((iconName) => (
            <div
              key={iconName}
              onClick={() => onIconChange(iconName)}
              style={{
                padding: 10,
                borderRadius: 8,
                cursor: 'pointer',
                border: icon === iconName ? `2px solid ${color || '#3b82f6'}` : '2px solid transparent',
                backgroundColor: icon === iconName ? `${color}15` : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <DynamicIcon name={iconName} color={icon === iconName ? color : '#64748b'} size={24} />
            </div>
          ))}
        </div>
      </FormField>

      <FormField label="Chọn Màu sắc">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {PRESET_COLORS.map((c) => (
            <div
              key={c.value}
              onClick={() => onColorChange(c.value)}
              title={c.name}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: c.value,
                cursor: 'pointer',
                border: color === c.value ? '3px solid #fff' : '2px solid transparent',
                boxShadow: color === c.value ? `0 0 0 2px ${c.value}` : 'none'
              }}
            />
          ))}
        </div>
      </FormField>
    </div>
  );
};
