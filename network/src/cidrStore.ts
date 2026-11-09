import { create } from "zustand";

export interface CidrState {
  ip: string;
  prefix: number;
  aws: boolean;
  compare: string;
  hosts: string;
  selected?: number;
  page: number;
  allocated: string[];
  list: boolean;
}
export const useCidr = create<CidrState>(() => ({
  ip: "192.168.1.0",
  prefix: 24,
  aws: false,
  compare: "192.168.1.128/25",
  hosts: "50",
  page: 0,
  allocated: [],
  list: false,
}));

export function loadAddressExample() {
  useCidr.setState({
    ip: "192.168.1.0",
    prefix: 29,
    aws: false,
    page: 0,
    selected: undefined,
    allocated: [],
  });
}
