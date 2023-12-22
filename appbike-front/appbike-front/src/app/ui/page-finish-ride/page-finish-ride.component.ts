import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsoService } from '../../services/uso.service';
import { UsoResponse } from '../../models/uso.interface';
import { ErrorHandlerService } from '../../services/error-handler.service';

@Component({
  selector: 'app-page-finish-ride',
  templateUrl: './page-finish-ride.component.html',
  styleUrl: './page-finish-ride.component.css'
})
export class PageFinishRideComponent implements OnInit {

  uso!: UsoResponse;
  isLoading = true;

  constructor(
    private usoService: UsoService,
    private router: Router
  , private errorHandler: ErrorHandlerService) { }

  ngOnInit(): void {
    
    this.usoService.getActiveUse().subscribe({
      next: resp => {
        this.uso = resp;
        this.isLoading = false;
      }, error: err => {
        this.errorHandler.handleHttpError(err)
      }
    })
  }

  
}
