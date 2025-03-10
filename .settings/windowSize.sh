# Obtén la resolución de la pantalla
screen_width=$(xdpyinfo | awk '/dimensions/{print $2}' | awk -Fx '{print $1}')
screen_height=$(xdpyinfo | awk '/dimensions/{print $2}' | awk -Fx '{print $2}')

# Calcula el 75% de la resolución de la pantalla
width=$(echo "$screen_width * 0.75" | bc -l | cut -d'.' -f1)
height=$(echo "$screen_height * 0.75" | bc -l | cut -d'.' -f1)

# Inicia Firefox con la geometría calculada
# firefox --geometry ${width}x${height}+0+0
echo "${width}x${height}+0+0"
echo "Width=$screen_width Height=$screen_height"