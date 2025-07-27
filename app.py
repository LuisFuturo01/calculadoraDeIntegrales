from flask import Flask, request, jsonify, send_from_directory
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application
from sympy.abc import *

app = Flask(__name__, static_folder='.', static_url_path='')

transformations = standard_transformations + (implicit_multiplication_application,)

@app.route('/')
def servir_pagina_principal():
    return send_from_directory('./', 'index.html')

@app.route('/<path:ruta>')
def servir_archivos_estaticos(ruta):
    return send_from_directory('..', ruta)

@app.route('/previsualizar_funcion', methods=['POST'])
def previsualizar_funcion():
    datos = request.json
    funcion_texto = datos.get('funcion')
    if not funcion_texto:
        return jsonify({'latex': ''})
    try:
        expresion = parse_expr(funcion_texto, transformations='all')
        latex_expresion = sp.latex(expresion)
        return jsonify({'latex': latex_expresion})
    except Exception as e:
        return jsonify({'error': "Sintaxis inválida. Ej: 'x**2', 'sin(x)', 'exp(x)'"}), 400


@app.route('/calcular_integral', methods=['POST'])
def calcular_integral():
    datos = request.json
    funcion_texto = datos.get('funcion')
    variable_texto = datos.get('variable', 'x')
    limite_inferior_texto = datos.get('limite_inferior', '')
    limite_superior_texto = datos.get('limite_superior', '')
    num_decimales = datos.get('decimales', 2)

    try:
        expresion = parse_expr(funcion_texto, transformations=transformations)
        variable = parse_expr(variable_texto, transformations=transformations)

        integral_indefinida = sp.integrate(expresion, variable)

        integral_definida_valor = None
        integral_definida_latex = None
        valor_numerico_definida = None
        latex_limite_inferior = None
        latex_limite_superior = None

        limite_inferior_obj = None
        if limite_inferior_texto.lower() in ['inf', 'oo']:
            limite_inferior_obj = sp.oo
            latex_limite_inferior = r'\infty'
        elif limite_inferior_texto.lower() in ['-inf', '-oo']:
            limite_inferior_obj = -sp.oo
            latex_limite_inferior = r'-\infty'
        elif limite_inferior_texto:
            limite_inferior_obj = parse_expr(limite_inferior_texto, transformations=transformations)
            latex_limite_inferior = sp.latex(limite_inferior_obj)

        limite_superior_obj = None
        if limite_superior_texto.lower() in ['inf', 'oo']:
            limite_superior_obj = sp.oo
            latex_limite_superior = r'\infty'
        elif limite_superior_texto.lower() in ['-inf', '-oo']:
            limite_superior_obj = -sp.oo
            latex_limite_superior = r'-\infty'
        elif limite_superior_texto:
            limite_superior_obj = parse_expr(limite_superior_texto, transformations=transformations)
            latex_limite_superior = sp.latex(limite_superior_obj)

        if limite_inferior_obj is not None and limite_superior_obj is not None:
            integral_definida_valor = sp.integrate(expresion, (variable, limite_inferior_obj, limite_superior_obj))
            integral_definida_latex = sp.latex(integral_definida_valor)

            if integral_definida_valor.is_real == True and integral_definida_valor not in [sp.oo, -sp.oo]:
                try:
                    valor_numerico_definida = str(integral_definida_valor.evalf(num_decimales))
                except Exception:
                    valor_numerico_definida = "No numérico / Error al evaluar"
            elif integral_definida_valor in [sp.oo, -sp.oo]:
                valor_numerico_definida = "Infinito"
            else:
                valor_numerico_definida = "No numérico / Complejo"

        respuesta = {
            'latex_funcion_original': sp.latex(expresion),
            'latex_variable': sp.latex(variable),
            'latex_integral_indefinida': sp.latex(integral_indefinida),
            'latex_integral_definida': integral_definida_latex,
            'valor_numerico_definida': valor_numerico_definida,
            'latex_limite_inferior': latex_limite_inferior,
            'latex_limite_superior': latex_limite_superior,
            'hay_infinito_limites': (limite_inferior_obj == sp.oo or limite_inferior_obj == -sp.oo or
                                     limite_superior_obj == sp.oo or limite_superior_obj == -sp.oo)
        }
        return jsonify(respuesta)

    except Exception as e:
        return jsonify({'error': f"Error: {str(e)}. Revisa tu entrada. Ej: 'x**2', 'sin(x)'. Para infinito usa 'inf' o '-inf'."}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)