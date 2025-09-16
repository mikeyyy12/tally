export interface RadioOption {
  letter: string;
  value: string;
}

interface BlockBase {
  id: string;
  type: "text" | "input" | "checkbox" | "radio" | "textarea" | "paragraph" |  "checkbox-group" | "checkbox-option"
| "multipleChoice-option" | "multipleChoice-group";
}

interface TextBlock extends BlockBase {
  type: "text";
  content?: string;
  label?:string
}

interface InputBlock extends BlockBase {
  type: "input";
  label: string;
   content?:string
  required?: boolean;
}

interface AreaBlock extends BlockBase{
  type:"textarea";
  label:string;
  required?:boolean;
}

interface CheckBoxGroup extends BlockBase{
  type:"checkbox-group",
  label?:string;
  required?:boolean

}
interface MultipleChoiceGroup extends BlockBase{
  type:"multipleChoice-group",
  label?:string;
  required?:string;
}

export interface MultipleChoiceOption extends BlockBase{
  type:"multipleChoice-option",
  label?:string;
  value?:string;
  parentId:string
    letter?:string;
  required?:string;
}
export interface CheckboxBlock extends BlockBase {
  type: "checkbox-option";
   label?:string
  value?:string;
  parentId:string
}

interface RadioBlock extends BlockBase {
  type: "radio";
   content?:string
  letter?:string;
  value?:string;
}

interface Paragraph extends BlockBase{
  type:"paragraph",
  content?:string
  label:string;
}

export type Blocktype = TextBlock | InputBlock | CheckboxBlock | RadioBlock | Paragraph | CheckBoxGroup | MultipleChoiceGroup | MultipleChoiceOption;
