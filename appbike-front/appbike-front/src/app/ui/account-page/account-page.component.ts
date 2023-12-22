import { Component, OnInit } from '@angular/core';
import { BikeUserService } from '../../services/bike-user.service';
import { BikeUser } from '../../models/user.interface';
import { UsoService } from '../../services/uso.service';
import { forkJoin } from 'rxjs';
import { Uso } from '../../models/uso.interface';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { UserBikeResponse } from '../../models/user-bike.interface';

@Component({
  selector: 'app-account-page',
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.css'
})
export class AccountPageComponent implements OnInit {
  userDetails!: BikeUser;
  userSaldo!: UserBikeResponse;
  usesByUserList!: Uso[];
  today = this.getReadableDate();
  userId!: string | null;
  listSize!: number;
  currentPage = 0;
  closeResult = '';
  form: any = {
    cardNumber: null,
    pin: null,
    pinRepeat: null
  };

  form2: any = {
    recharge: null,
    pin: null,
  };
  isLoadingModal = true;
  isSuccessful = false;
  errorMessage = '';
  incorrectPin = false;

  constructor(private bikeUserService: BikeUserService, private userService: UserService, private usoService: UsoService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.userId = localStorage.getItem('USER_ID');

    if (this.userId) {
      let userDetailsRequest = this.bikeUserService.getUserDetails(this.userId);
      let usesByUserRequest = this.usoService.getUsosByUser(this.userId, this.currentPage);

      forkJoin([userDetailsRequest, usesByUserRequest]).subscribe(resp => {
        this.userDetails = resp[0];
        this.usesByUserList = resp[1].content;
        this.listSize = resp[1].totalElements;
      })
    }
  }

  getReadableDate() {
    let today = new Date();
    var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const todayDay = days[today.getDay()];
    const todayDayNumber = today.toLocaleDateString('en-US', { day: 'numeric' });;
    const todayMonth = today.toLocaleDateString('en-US', { month: 'long' });
    const todayYear = today.getFullYear();

    return `${todayDay}, ${todayDayNumber} ${todayMonth} ${todayYear}`;
  }

  loadNewPage() {
    this.userId ?
      this.usoService.getUsosByUser(this.userId, this.currentPage - 1).subscribe(resp => {
        this.usesByUserList = resp.content;
      }) :
      console.error("User Id has not been properly loaded.");

  }

  open(modal: any) {
    this.modalService.open(modal, { ariaLabelledBy: 'modal-basic-title' }).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      },
    );
  }

  private getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return 'by pressing ESC';
      case ModalDismissReasons.BACKDROP_CLICK:
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }

  onSubmit() {
    this.userDetails.numTarjeta = this.form.cardNumber;
    this.userDetails.pin = this.form.pin;
    this.bikeUserService.setCard(this.userId, this.userDetails).subscribe(resp => {
      this.userDetails = resp;
      window.location.reload();
    })
  }

  openModal(arg0: any) {
    this.userService.getUserDetails().subscribe(resp => {
      this.userSaldo = resp
      this.isLoadingModal = false;
    })
    this.isSuccessful = false;
    this.modalService.open(arg0, {
      keyboard: false

    })
  }

  onSubmitSaldo() {
    this.userService.recharge(this.form2).subscribe({
      next: data => {
        console.log(data);
        this.isSuccessful = true;
        this.incorrectPin = false;
        this.modalService.dismissAll()
        this.ngOnInit();
      },
      error: err => {
        if (err.status == 400) {
          this.incorrectPin = true;
          this.isSuccessful = false;
        }
        this.errorMessage = err.error.message;
        console.log(err);
      },
    });
  }
}
