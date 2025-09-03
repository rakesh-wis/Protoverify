import { Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Image from '@ckeditor/ckeditor5-image/src/image';
import { CKEditorUploadAdapter } from 'src/app/adapter/ckEditor.adapter';
import { SERVICES } from 'src/app/helpers';

@Component({
	selector: 'app-text-editor',
	templateUrl: './text-editor.component.html',
	styleUrls: ['./text-editor.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TextEditorComponent),
			multi: true,
		},
		{
			provide: NG_VALIDATORS,
			useExisting: forwardRef(() => TextEditorComponent),
			multi: true,
		},
	],
})
export class TextEditorComponent implements OnInit, ControlValueAccessor, OnChanges, Validator {
	public Editor = ClassicEditor;
	@Input() formControl: FormControl;
	@Output() InitValue: EventEmitter<any> = new EventEmitter();
	@Output() keyUp: EventEmitter<any> = new EventEmitter();
	@Output() blur: EventEmitter<any> = new EventEmitter();
	public inputCtrl: any;

	public inFocus = false;

	public inputFormControl: FormControl = new FormControl();
	public currentValue = '';

	editorConfig = {
		toolbar: {
			items: [
				'undo',
				'redo',
				'|',
				// 'findAndReplace',
				// 'selectAll',
				'|',
				'heading',
				'|',
				'bold',
				'italic',
				'strikethrough',
				'underline',
				'code',
				'subscript',
				'superscript',
				'|',
				'specialCharacters',
				'horizontalLine',
				'pageBreak',
				'|',
				'-',
				'highlight',
				'fontSize',
				'fontFamily',
				'fontColor',
				'fontBackgroundColor',
				'|',
				'link',
				'blockQuote',
				'insertTable',
				'uploadImage',
				'ckbox',
				// 'mediaEmbed',
				'codeBlock',
				// 'htmlEmbed',
				'|',
				'bulletedList',
				'numberedList',
				'todoList',
				'|',
				'outdent',
				'indent',
				'alignment',
				'|',
				'textPartLanguage',
				'|',
				'sourceEditing',
			],
		},
		image: {
			toolbar: [
				'imageStyle:inline',
				'imageStyle:block',
				'imageStyle:side',
				'|',
				'toggleImageCaption',
				'imageTextAlternative',
			],
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells',
				'tableProperties',
				'tableCellProperties',
				'toggleTableCaption',
			],
		},
	};
	constructor() {}

	ngOnInit(): void {
		this.initInputListener();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['formControl'] && this.formControl) {
			this.currentValue = this.formControl.value;
			this.InitValue.emit(this.formControl.value);
		}
	}
	onReady(editor): void {
		editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
			return new CKEditorUploadAdapter(loader, SERVICES.CMS, '/shared/upload');
		};
	}

	writeValue(obj: any): void {
		this.setInputValue(obj);
	}

	registerOnChange(fn: any): void {
		this.propagateChange = fn;
	}
	registerOnTouched(fn: any): void {
		this.onTouched = fn;
	}
	public handleKeyUp(event: { srcElement: any }) {
		this.keyUp.emit(event);
		this.inputCtrl = event.srcElement;
	}
	public onFocus() {
		this.inFocus = true;
	}

	public onBlur() {
		this.inFocus = false;
		this.blur.emit();
	}
	onTouched = () => {};

	private propagateChange = (_: any) => {};

	private initInputListener() {
		// Whenever input is changed (by text, or textMask), transform and set current value
		this.inputFormControl.valueChanges.subscribe((val) => {
			this.setCurrentValue(val);
		});
	}

	private setInputValue(value: any) {
		this.inputFormControl.setValue(value, { emitEvent: false });
	}

	private setCurrentValue(val: any, justChange = false) {
		this.currentValue = val;

		// For number input; if non-number is entered, wipe input clean!
		if (val === null) {
			this.setInputValue(val);
		}

		if (!justChange) {
			this.propagateChange(val);
		}
	}

	public validate(control: FormControl) {
		return {};
	}
}
