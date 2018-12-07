import { Component, OnInit, Input, ViewChild, Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { CommentStmt } from '@angular/compiler';
import { Comment } from '../shared/comment';
import { visibility, expand, flyInOut } from '../animations/app.animation';



@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss'],
  animations: [
    visibility(),
    expand(), 
    flyInOut(),
  ]
})
export class DishdetailComponent implements OnInit {
  @ViewChild('fform') feedbackFormDirective;

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  feedbackForm: FormGroup;
  feedback: Feedback;
  errMess: string;
  dishcopy: Dish;
  comment: Comment;
  visibility = 'shown';


  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Name is Required.',
      'minlength': 'Name must be at least 2 characters long.',
      'maxlength': 'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required': 'Comment is required.',
    },
  };
  dishservice: any;
  commentForm: any;
  

  constructor(private dishService: DishService,
    @Inject('BaseURL') private BaseURL,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
    
  }

  ngOnInit() {
    this.createForm();
    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
    .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
      errmess => this.errMess = <any>errmess);
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  createForm() {
    this.feedbackForm = this.fb.group({
      author: ['', [Validators.required, Validators.minLength(2)]],
      rating: 5,
      comment: ['', [Validators.required]]
    });
    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re) set form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.comment = this.feedbackForm.value;
    this.comment = {...this.feedbackForm.value, date: new Date().toISOString()};
this.dishcopy.comments.push(this.comment);
    this.dishService.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish;  this.dishcopy = dish;
    },
    errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.feedbackFormDirective.resetForm();
    this.feedbackForm.reset({
      author: '',
      rating: 5,
      comment: ''
    });
  
     
  }


  goBack(): void {
    this.location.back();
  }

}

