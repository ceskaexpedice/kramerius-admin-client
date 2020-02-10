export interface SimpleDialogData {
  title: string;
  message: string;
  btn1: SimpleDialogButton;
  btn2?: SimpleDialogButton;
  checkbox?: SimpleDialogCheckbox;
  numberInput?: SimpleDialogNumberInput;
  width?: number;
}

export interface SimpleDialogButton {
  color: string;
  label: string;
  value: string;
}

export interface SimpleDialogCheckbox {
  label: string;
  checked: boolean;
}

export interface SimpleDialogNumberInput {
  label: string;
  value: number;
  min: number;
  max: number;
}
