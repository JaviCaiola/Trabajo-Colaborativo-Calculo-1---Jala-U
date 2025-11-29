import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
    selector: 'app-example-d3',
    standalone: true,
    templateUrl: './example-d3.component.html',
    styleUrls: ['./example-d3.component.css']
})
export class ExampleD3Component implements OnInit {
    @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

    ngOnInit(): void {
        this.createChart();
    }

    private createChart(): void {
        const element = this.chartContainer.nativeElement;
        const data = [10, 20, 30, 40, 50];
        const width = 300;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };

        const svg = d3.select(element)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const x = d3.scaleBand()
            .domain(data.map((d, i) => i.toString()))
            .range([margin.left, width - margin.right])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data) || 0])
            .nice()
            .range([height - margin.bottom, margin.top]);

        svg.append('g')
            .attr('fill', 'steelblue')
            .selectAll('rect')
            .data(data)
            .join('rect')
            .attr('x', (d, i) => x(i.toString())!)
            .attr('y', d => y(d))
            .attr('height', d => y(0) - y(d))
            .attr('width', x.bandwidth());

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).tickFormat((d, i) => `Item ${i + 1}`));

        svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(y));
    }
}
