import { Component } from '@angular/core';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { OperatorDemo } from '../../components/operator-demo/operator-demo';

@Component({
  selector: 'app-main-operators',
  imports: [Tabs, TabList, Tab, TabPanels, TabPanel, OperatorDemo],
  templateUrl: './main-operators.html',
  styleUrl: './main-operators.css',
})
export class MainOperators {}
