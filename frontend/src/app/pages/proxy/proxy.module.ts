import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { MatCheckboxModule } from '@angular/material/checkbox';


import { ProxyRoutingModule } from './proxy-routing.module';
import { ProxyComponent } from './proxy.component';


@NgModule({
  declarations: [ProxyComponent],
  imports: [
    CommonModule,
    FormsModule,
    ProxyRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,
    MatExpansionModule,
    MatSelectModule,
    MatCheckboxModule,
    MonacoEditorModule.forRoot()
  ]
})
export class ProxyModule { }
