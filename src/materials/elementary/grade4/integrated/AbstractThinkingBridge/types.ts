export interface LearningModule {
  id: string;
  title: string;
  icon: React.ReactNode;
  component: React.FC<ModuleComponentProps>;
  description: string;
}

export interface ModuleComponentProps {
  onConceptMastered: (conceptId: string) => void;
  progress: Record<string, boolean>;
}

export interface Concept {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prerequisiteIds?: string[];
}

export interface LearningProgress {
  [moduleId: string]: {
    [conceptId: string]: boolean;
  };
}

export interface ProportionData {
  x: number;
  y: number;
  relationship: 'proportional' | 'inverse';
}

export interface Shape3D {
  type: 'cube' | 'rectangular' | 'pyramid' | 'cylinder';
  dimensions: {
    width: number;
    height: number;
    depth?: number;
    radius?: number;
  };
}

export interface ElectricCircuit {
  components: CircuitComponent[];
  connections: Connection[];
  current: number;
  voltage: number;
}

export interface CircuitComponent {
  id: string;
  type: 'battery' | 'bulb' | 'switch' | 'resistor';
  position: { x: number; y: number };
  properties: {
    voltage?: number;
    resistance?: number;
    isOn?: boolean;
  };
}

export interface Connection {
  from: string;
  to: string;
  current: number;
}

export interface MagneticField {
  poles: MagneticPole[];
  fieldLines: FieldLine[];
}

export interface MagneticPole {
  type: 'north' | 'south';
  position: { x: number; y: number };
  strength: number;
}

export interface FieldLine {
  points: { x: number; y: number }[];
  strength: number;
}