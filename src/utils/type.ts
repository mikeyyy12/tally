export interface RadioOption {
  letter: string;
  value: string;
}

interface BlockBase {
  id: string;
  type: "text" | "input" | "checkbox" | "radio" | "textarea" | "paragraph";
}

interface TextBlock extends BlockBase {
  type: "text";
  content?: string;
}

interface InputBlock extends BlockBase {
  type: "input";
  label: string;
  required?: boolean;
}

interface AreaBlock extends BlockBase{
  type:"textarea";
  label:string;
  require?:boolean;
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

interface Paragraph extends BlockBase{
  type:"paragraph",
  label:string;
}

export type Blocktype = TextBlock | InputBlock | CheckboxBlock | RadioBlock | Paragraph;
