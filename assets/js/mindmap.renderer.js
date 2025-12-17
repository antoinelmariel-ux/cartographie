(function (global) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const DEFAULT_STYLE_KEY = 'smooth';

    const STYLE_PRESETS = {
        smooth: {
            label: 'Courbes lissées',
            strokeWidth: 3,
            curvature: 0.35,
            marker: 'circle',
            arrow: true,
            useGradient: false,
            opacity: 0.9,
            className: 'mindmap-link--smooth'
        },
        orthogonal: {
            label: 'Orthogonaux',
            strokeWidth: 2.5,
            cornerRadius: 18,
            marker: null,
            arrow: false,
            opacity: 0.85,
            pathStrategy: 'orthogonal',
            className: 'mindmap-link--orthogonal'
        },
        fluid: {
            label: 'Fluide',
            strokeWidth: 3.5,
            curvature: 0.55,
            marker: 'circle',
            arrow: true,
            useGradient: true,
            opacity: 0.95,
            className: 'mindmap-link--fluid'
        }
    };

    class MindMapRenderer {
        constructor(options = {}) {
            this.styles = { ...STYLE_PRESETS, ...(options.styles || {}) };
            this.engineFactory = options.engineFactory || null;
            this.externalBezierClass = options.externalBezierClass || global.Bezier || null;
            this.engine = null;
        }

        static getStylePresets() {
            return { ...STYLE_PRESETS };
        }

        static get DEFAULT_STYLE_KEY() {
            return DEFAULT_STYLE_KEY;
        }

        setEngineFactory(factory) {
            this.engineFactory = typeof factory === 'function' ? factory : null;
            this.engine = null;
        }

        setExternalBezierClass(ClassRef) {
            if (typeof ClassRef === 'function') {
                this.externalBezierClass = ClassRef;
            }
        }

        getEngine() {
            if (this.engine) {
                return this.engine;
            }

            const externalEngine = typeof this.engineFactory === 'function'
                ? this.engineFactory()
                : null;

            if (externalEngine && typeof externalEngine.renderLinks === 'function') {
                this.engine = externalEngine;
            } else {
                this.engine = this.createNativeEngine();
            }

            return this.engine;
        }

        render(payload = {}) {
            const engine = this.getEngine();
            if (!engine || typeof engine.renderLinks !== 'function') {
                return;
            }

            const styleKey = this.resolveStyleKey(payload.style);
            const style = this.styles[styleKey];

            engine.renderLinks({
                ...payload,
                style,
                styleKey
            });
        }

        resolveStyleKey(key) {
            return key && this.styles[key] ? key : DEFAULT_STYLE_KEY;
        }

        createNativeEngine() {
            return {
                renderLinks: (context) => this.renderWithSvg(context)
            };
        }

        renderWithSvg({ linkLayer, wrapper, links = [], style, styleKey }) {
            if (!linkLayer || !wrapper) {
                return;
            }

            const wrapperRect = wrapper.getBoundingClientRect();
            const width = Math.max(wrapper.scrollWidth, wrapperRect.width);
            const height = Math.max(wrapper.scrollHeight, wrapperRect.height);

            linkLayer.setAttribute('width', width);
            linkLayer.setAttribute('height', height);
            linkLayer.setAttribute('viewBox', `0 0 ${width} ${height}`);
            linkLayer.style.width = `${width}px`;
            linkLayer.style.height = `${height}px`;
            linkLayer.innerHTML = '';

            const defs = document.createElementNS(SVG_NS, 'defs');
            linkLayer.appendChild(defs);

            links.forEach((descriptor, index) => {
                const geometry = this.computeGeometry(descriptor, wrapperRect);
                if (!geometry) {
                    return;
                }

                const stroke = style?.useGradient
                    ? this.createGradient(defs, descriptor.accent, index, styleKey)
                    : descriptor.accent || 'var(--primary-color)';

                const path = this.createPathElement(style, geometry, stroke, styleKey, descriptor.type);
                if (!path) {
                    return;
                }

                linkLayer.appendChild(path);

                if (style?.arrow) {
                    const markerId = this.ensureArrowMarker(defs, descriptor.accent || stroke, styleKey);
                    path.setAttribute('marker-end', `url(#${markerId})`);
                }

                if (style?.marker === 'circle' || descriptor.type === 'reference') {
                    const circle = this.createCircleMarker(geometry.end, descriptor.accent, style);
                    linkLayer.appendChild(circle);
                }
            });
        }

        computeGeometry(descriptor, wrapperRect) {
            if (!descriptor?.source || !descriptor?.target) {
                return null;
            }

            const sourceRect = descriptor.source.getBoundingClientRect();
            const targetRect = descriptor.target.getBoundingClientRect();

            const isHierarchy = descriptor.type === 'hierarchy';

            const start = isHierarchy
                ? {
                    x: sourceRect.left - wrapperRect.left + sourceRect.width / 2,
                    y: sourceRect.bottom - wrapperRect.top - 4
                }
                : {
                    x: sourceRect.right - wrapperRect.left,
                    y: sourceRect.top + sourceRect.height / 2 - wrapperRect.top
                };

            const end = isHierarchy
                ? {
                    x: targetRect.left - wrapperRect.left + targetRect.width / 2,
                    y: targetRect.top - wrapperRect.top + 4
                }
                : {
                    x: targetRect.left - wrapperRect.left,
                    y: targetRect.top + targetRect.height / 2 - wrapperRect.top
                };

            return { start, end, isHierarchy };
        }

        createPathElement(style, geometry, stroke, styleKey, linkType) {
            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', stroke);
            path.setAttribute('stroke-width', style?.strokeWidth || 2);
            path.setAttribute('stroke-opacity', style?.opacity || 1);
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');
            path.setAttribute('class', `mindmap-link-path ${style?.className || ''}`.trim());

            const pathStrategy = style?.pathStrategy || 'cubic';
            if (pathStrategy === 'orthogonal') {
                path.setAttribute('d', this.buildOrthogonalPath(geometry, style));
            } else {
                path.setAttribute('d', this.buildCurvePath(geometry, style, linkType));
            }

            if (style?.dashArray) {
                path.setAttribute('stroke-dasharray', style.dashArray);
            }

            return path;
        }

        buildCurvePath(geometry, style, linkType) {
            const { start, end } = geometry;
            const curvatureRatio = style?.curvature || 0.35;

            const horizontalCurvature = Math.max(60, Math.abs(end.x - start.x) * curvatureRatio);
            const verticalCurvature = Math.max(28, Math.abs(end.y - start.y) * curvatureRatio);

            const cp1 = linkType === 'hierarchy'
                ? { x: start.x, y: start.y + verticalCurvature }
                : { x: start.x + horizontalCurvature, y: start.y };

            const cp2 = linkType === 'hierarchy'
                ? { x: end.x, y: end.y - verticalCurvature }
                : { x: end.x - horizontalCurvature, y: end.y };

            if (this.externalBezierClass) {
                try {
                    const curve = new this.externalBezierClass(start.x, start.y, cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
                    const points = Array.isArray(curve.points) ? curve.points : [start, cp1, cp2, end];
                    return `M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
                } catch (error) {
                    // Fallback on native path creation below
                }
            }

            return `M ${start.x} ${start.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
        }

        buildOrthogonalPath(geometry, style) {
            const { start, end } = geometry;
            const midX = (start.x + end.x) / 2;
            const radius = Math.max(style?.cornerRadius || 12, 8);

            const points = [
                `M ${start.x} ${start.y}`,
                `L ${midX - radius} ${start.y}`,
                `Q ${midX} ${start.y} ${midX} ${start.y + Math.sign(end.y - start.y) * radius}`,
                `L ${midX} ${end.y - Math.sign(end.y - start.y) * radius}`,
                `Q ${midX} ${end.y} ${midX + Math.sign(end.x - midX) * radius} ${end.y}`,
                `L ${end.x} ${end.y}`
            ];

            return points.join(' ');
        }

        createGradient(defs, accent, index, styleKey) {
            const color = accent || '#0ea5e9';
            const gradientId = `mindmap-link-gradient-${styleKey}-${index}`;
            const gradient = document.createElementNS(SVG_NS, 'linearGradient');
            gradient.id = gradientId;
            gradient.setAttribute('x1', '0%');
            gradient.setAttribute('y1', '0%');
            gradient.setAttribute('x2', '100%');
            gradient.setAttribute('y2', '0%');

            const startStop = document.createElementNS(SVG_NS, 'stop');
            startStop.setAttribute('offset', '0%');
            startStop.setAttribute('stop-color', color);
            startStop.setAttribute('stop-opacity', '0.55');

            const midStop = document.createElementNS(SVG_NS, 'stop');
            midStop.setAttribute('offset', '50%');
            midStop.setAttribute('stop-color', color);
            midStop.setAttribute('stop-opacity', '0.9');

            const endStop = document.createElementNS(SVG_NS, 'stop');
            endStop.setAttribute('offset', '100%');
            endStop.setAttribute('stop-color', color);
            endStop.setAttribute('stop-opacity', '0.6');

            gradient.appendChild(startStop);
            gradient.appendChild(midStop);
            gradient.appendChild(endStop);
            defs.appendChild(gradient);

            return `url(#${gradientId})`;
        }

        ensureArrowMarker(defs, accent, styleKey) {
            const color = accent || '#0ea5e9';
            const id = `mindmap-arrow-${styleKey}-${color.replace(/[^a-z0-9]/gi, '')}`;

            if (defs.querySelector(`#${id}`)) {
                return id;
            }

            const marker = document.createElementNS(SVG_NS, 'marker');
            marker.id = id;
            marker.setAttribute('viewBox', '0 0 10 10');
            marker.setAttribute('refX', '9');
            marker.setAttribute('refY', '5');
            marker.setAttribute('markerWidth', '8');
            marker.setAttribute('markerHeight', '8');
            marker.setAttribute('orient', 'auto-start-reverse');

            const path = document.createElementNS(SVG_NS, 'path');
            path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
            path.setAttribute('fill', color);
            path.setAttribute('opacity', '0.9');

            marker.appendChild(path);
            defs.appendChild(marker);

            return id;
        }

        createCircleMarker(endPoint, accent, style) {
            const circle = document.createElementNS(SVG_NS, 'circle');
            circle.setAttribute('cx', endPoint.x);
            circle.setAttribute('cy', endPoint.y);
            circle.setAttribute('r', style?.markerRadius || 6);
            circle.setAttribute('fill', '#ffffff');
            circle.setAttribute('stroke', accent || 'var(--primary-color)');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('class', 'mindmap-link-marker');
            return circle;
        }
    }

    global.MindMapRenderer = MindMapRenderer;
})(typeof window !== 'undefined' ? window : globalThis);
