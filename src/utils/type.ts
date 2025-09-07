interface RadioOption {
  letter: string; // 'A', 'B', 'C'...
  value: string;  // user-entered option text
}

interface BlockBase {
  id: string;
  type: "text" | "input" | "checkbox" | "radio";
}

interface TextBlock extends BlockBase {
  type: "text";
  content: string;
}

interface InputBlock extends BlockBase {
  type: "input";
  label: string;
  required?: boolean;
}

interface CheckboxBlock extends BlockBase {
  type: "checkbox";
  label: string;
  options: string[];
}



interface RadioBlock extends BlockBase {
  type: "radio";
  label: string;
  options: RadioOption[];
}

export type Blocktype = TextBlock | InputBlock | CheckboxBlock | RadioBlock;
